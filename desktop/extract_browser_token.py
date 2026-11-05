#!/usr/bin/env python3
import glob, os, sys, shutil, tempfile, subprocess, time, json, socket, struct, base64, urllib.request

def ws_handshake(sock, host, port, path):
    key = base64.b64encode(os.urandom(16)).decode('utf-8')
    req = f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
    sock.sendall(req.encode('utf-8'))
    resp = b''
    while b'\r\n\r\n' not in resp: resp += sock.recv(1024)

def send_ws(sock, data):
    p = data.encode('utf-8')
    l = len(p)
    mask = os.urandom(4)
    m = bytearray(b ^ mask[i % 4] for i, b in enumerate(p))
    if l <= 125:
        h = bytearray([0x81, 0x80 | l])
    elif l <= 65535:
        h = bytearray([0x81, 0x80 | 126]) + struct.pack(">H", l)
    else:
        h = bytearray([0x81, 0x80 | 127]) + struct.pack(">Q", l)
    h.extend(mask + m)
    sock.sendall(h)

def recv_full(sock):
    header = sock.recv(2)
    if not header: return ""
    b1, b2 = header[0], header[1]
    length = b2 & 0x7F
    if length == 126:
        ext = sock.recv(2)
        length = struct.unpack(">H", ext)[0]
    elif length == 127:
        ext = sock.recv(8)
        length = struct.unpack(">Q", ext)[0]
    raw = bytearray()
    while len(raw) < length:
        chunk = sock.recv(min(65536, length - len(raw)))
        if not chunk: break
        raw.extend(chunk)
    return raw.decode("utf-8", errors="ignore")

def find_cookie_files():
    home = os.environ.get("HOME", "/home/aluynon")
    patterns = [
        f"{home}/.config/chromium/*/Network/Cookies",
        f"{home}/.config/chromium/*/Cookies",
        f"{home}/.config/google-chrome/*/Network/Cookies",
        f"{home}/.config/google-chrome/*/Cookies",
        f"{home}/.config/BraveSoftware/*/Network/Cookies",
    ]
    res = []
    for p in patterns:
        res.extend(glob.glob(p))
    return res

def extract_token():
    cookie_files = find_cookie_files()
    if not cookie_files:
        return None

    # Choose cookie file with soundcloud entries
    chosen = None
    import sqlite3
    for cf in cookie_files:
        try:
            tmp = tempfile.mktemp(suffix=".sqlite")
            shutil.copy2(cf, tmp)
            conn = sqlite3.connect(tmp)
            cursor = conn.cursor()
            cursor.execute("SELECT count(*) FROM cookies WHERE host_key LIKE '%soundcloud%' AND name = 'oauth_token'")
            count = cursor.fetchone()[0]
            conn.close()
            os.remove(tmp)
            if count > 0:
                chosen = cf
                break
        except Exception:
            pass

    if not chosen:
        chosen = cookie_files[0]

    tmp_dir = tempfile.mkdtemp(prefix="sc-import-")
    default_dir = os.path.join(tmp_dir, "Default")
    net_dir = os.path.join(default_dir, "Network")
    os.makedirs(net_dir, exist_ok=True)
    shutil.copy2(chosen, os.path.join(default_dir, "Cookies"))
    shutil.copy2(chosen, os.path.join(net_dir, "Cookies"))

    port = 9477
    proc = subprocess.Popen([
        "/usr/bin/chromium-browser",
        f"--user-data-dir={tmp_dir}",
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--remote-debugging-port={port}",
        "https://soundcloud.com/discover"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    token = None
    try:
        time.sleep(2.5)
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json") as r:
            tabs = json.loads(r.read().decode())
            page = next(t for t in tabs if t.get("type") == "page")
            path = page["webSocketDebuggerUrl"].split(f"127.0.0.1:{port}")[1]

        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("127.0.0.1", port))
        ws_handshake(s, "127.0.0.1", port, path)

        send_ws(s, json.dumps({"id": 1, "method": "Network.getCookies", "params": {"urls": ["https://soundcloud.com"]}}))
        for _ in range(10):
            frame = recv_full(s)
            if '"id":1' in frame:
                cookies = json.loads(frame).get("result", {}).get("cookies", [])
                for c in cookies:
                    if c.get("name") == "oauth_token":
                        token = c.get("value")
                        break
                break
    except Exception as e:
        sys.stderr.write(f"Extraction error: {e}\n")
    finally:
        proc.terminate()
        proc.wait()
        shutil.rmtree(tmp_dir, ignore_errors=True)

    return token

if __name__ == "__main__":
    t = extract_token()
    if t:
        print(json.dumps({"success": True, "oauth_token": t}))
    else:
        print(json.dumps({"success": False, "error": "No soundcloud token found in browser"}))
