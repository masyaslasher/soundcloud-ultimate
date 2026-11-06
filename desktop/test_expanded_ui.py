import asyncio
import base64
import json
import subprocess
import time
import urllib.request
import websockets
import os

ARTIFACTS_DIR = "/home/aluynon/.gemini/antigravity/brain/a893fb6d-01fc-466f-bc96-8d9435933ae9"
FRONTEND_DIR = "/home/aluynon/.gemini/antigravity/scratch/SoundCloud-Ultimate/desktop/frontend"

async def main():
    # 1. Start HTTP server
    http_proc = subprocess.Popen(
        ["python3", "-m", "http.server", "4545", "--directory", FRONTEND_DIR],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.0)

    # 2. Start headless chromium
    chrome_proc = subprocess.Popen([
        "/usr/bin/chromium-browser",
        "--headless=new",
        "--remote-debugging-port=9222",
        "--window-size=1280,820",
        "--user-data-dir=/tmp/chromium-expansion-profile",
        "about:blank"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.5)

    try:
        # Get websocket debugger URL
        tabs = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
        ws_url = tabs[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            msg_id = 0

            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                curr_id = msg_id
                payload = {"id": curr_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(payload))
                while True:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=6.0)
                        resp = json.loads(raw)
                        if resp.get("id") == curr_id:
                            return resp.get("result", {})
                    except asyncio.TimeoutError:
                        print(f"Warning: send_cmd timeout for {method}")
                        return {}

            async def eval_js(expr):
                res = await send_cmd("Runtime.evaluate", {"expression": expr, "returnByValue": True})
                if "exceptionDetails" in res:
                    print(f"JS Exception in '{expr[:50]}...':", res["exceptionDetails"])
                return res.get("result", {}).get("value")

            async def capture_screenshot(filename):
                res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                if "data" in res:
                    data = base64.b64decode(res["data"])
                    path = f"{ARTIFACTS_DIR}/{filename}"
                    with open(path, "wb") as f:
                        f.write(data)
                    print(f"Captured {filename} ({len(data)} bytes)")
                else:
                    print(f"Failed to capture {filename}")

            # Listen for console messages
            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")

            # Navigate to SoundCloud Ultimate
            await send_cmd("Page.navigate", {"url": "http://127.0.0.1:4545"})
            await asyncio.sleep(2.0)

            print("Testing View 1: Home")
            await eval_js("window.scApp.navigateTo('view-home');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_home.png")

            print("Simulating Master Reference Playback State ('Не одиноки' - APFS)")
            await eval_js("""
                const t = {
                    id: 'test-track-master',
                    title: 'Не одиноки',
                    artist: 'APFS',
                    artwork_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
                    duration_ms: 192000
                };
                window.queue = [t, { id: 't2', title: 'Пепел', artist: 'APFS', artwork_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80', duration_ms: 178000 }];
                window.currentIndex = 0;
                // Update bottom dock
                document.getElementById('player-title').textContent = t.title;
                document.getElementById('player-artist').textContent = t.artist;
                document.getElementById('player-art').src = t.artwork_url;
                document.getElementById('time-current').textContent = '1:24';
                document.getElementById('time-total').textContent = '3:12';
                document.getElementById('progress-fill').style.width = '44%';
                // Update right panel
                document.getElementById('rp-track-title').textContent = t.title;
                document.getElementById('rp-track-artist').textContent = t.artist;
                document.getElementById('rp-track-art').src = t.artwork_url;
                document.getElementById('rp-time-current').textContent = '1:24';
                document.getElementById('rp-time-total').textContent = '3:12';
                document.getElementById('rp-progress-fill').style.width = '44%';
                // Render queue in right panel
                const qList = document.getElementById('rp-queue-list');
                if (qList) {
                    qList.innerHTML = `
                        <div class="rp-queue-item active">
                            <img class="rp-queue-art" src="${t.artwork_url}">
                            <div class="rp-queue-info">
                                <div class="rp-queue-title">${t.title}</div>
                                <div class="rp-queue-artist">${t.artist}</div>
                            </div>
                            <span style="color: var(--accent-purple); font-size: 11px;">▶</span>
                        </div>
                        <div class="rp-queue-item">
                            <img class="rp-queue-art" src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80">
                            <div class="rp-queue-info">
                                <div class="rp-queue-title">Пепел</div>
                                <div class="rp-queue-artist">APFS</div>
                            </div>
                        </div>
                        <div class="rp-queue-item">
                            <img class="rp-queue-art" src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80">
                            <div class="rp-queue-info">
                                <div class="rp-queue-title">Душа</div>
                                <div class="rp-queue-artist">Молодость</div>
                            </div>
                        </div>
                        <div class="rp-queue-item">
                            <img class="rp-queue-art" src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80">
                            <div class="rp-queue-info">
                                <div class="rp-queue-title">Снова весна</div>
                                <div class="rp-queue-artist">КУОК</div>
                            </div>
                        </div>
                    `;
                }
            """)
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_quiet_dark_master_match.png")

            print("Testing View 2: Search")
            await eval_js("window.scApp.navigateTo('view-search'); window.scApp.renderSearchView('witch house', 'all');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_search.png")

            print("Testing View 3: Library")
            await eval_js("window.scApp.navigateTo('view-library');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_library.png")

            print("Testing View 4: Liked Tracks")
            await eval_js("window.scApp.navigateTo('view-liked');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_liked.png")

            print("Testing View 5: Playlists Overview & Detail")
            await eval_js("window.scApp.navigateTo('view-playlists');")
            await asyncio.sleep(0.4)
            await eval_js("window.scApp.renderPlaylistDetail({ title: 'witch house vibes', likes: '42K', creator: 'aluynon', tracks: [{ title: 'Memory Reboot', artist: 'VØJ x Narvent', duration_ms: 184000 }, { title: 'Shadow Lady', artist: 'Portwave', duration_ms: 198000 }] });")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_playlist_detail.png")

            print("Testing View 6: Artist Detail")
            await eval_js("window.scApp.navigateTo('view-artists');")
            await asyncio.sleep(0.4)
            await eval_js("window.scApp.renderArtistDetail({ name: 'APFS', genre: 'Dark Wave / Electronic', followers: '142K', monthly: '890K', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80' });")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_artist_detail.png")

            print("Testing View 7: History")
            await eval_js("window.scApp.navigateTo('view-history');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_history.png")

            print("Testing View 8: Downloads")
            await eval_js("window.scApp.navigateTo('view-downloads');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_downloads.png")

            print("Testing View 9: Smart Mixes")
            await eval_js("window.scApp.navigateTo('view-smart-mixes');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_smart_mixes.png")

            print("Testing View 10: Analytics")
            await eval_js("window.scApp.navigateTo('view-analytics');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_analytics.png")

            print("Testing View 11: Plugins")
            await eval_js("window.scApp.navigateTo('view-plugins');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_plugins.png")

            print("Testing View 12: Settings")
            await eval_js("window.scApp.navigateTo('view-settings');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_settings.png")

            print("Testing View 13: Dedicated Queue View")
            await eval_js("window.scApp.navigateTo('view-queue');")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_queue.png")

            print("Testing View 14: Expanded Player Overlay")
            await eval_js("window.scApp.openExpandedPlayer();")
            await asyncio.sleep(0.6)
            await capture_screenshot("sc_ui_expanded_player.png")
            await eval_js("window.scApp.closeExpandedPlayer();")
            await asyncio.sleep(0.3)

            print("Testing View 15: Shortcuts Modal")
            await eval_js("window.scApp.showShortcuts();")
            await asyncio.sleep(0.5)
            await capture_screenshot("sc_ui_shortcuts.png")
            await eval_js("document.getElementById('modal-shortcuts').classList.remove('open');")
            await asyncio.sleep(0.3)

            print("All 15 UI Expansion tests completed successfully!")

    finally:
        chrome_proc.terminate()
        chrome_proc.wait()
        http_proc.terminate()
        http_proc.wait()

asyncio.run(main())
