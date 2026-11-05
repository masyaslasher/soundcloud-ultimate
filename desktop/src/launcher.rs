use std::process::{Child, Command};

pub fn launch_desktop_window(url: &str) -> Option<Child> {
    #[cfg(windows)]
    {
        let temp_dir = std::env::temp_dir();
        let user_data = temp_dir.join("soundcloud-desktop-profile");
        let user_data_str = user_data.to_string_lossy().to_string();

        let candidates = [
            // Edge standard paths (built-in on Windows 10/11)
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            // Chrome standard paths
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            // Brave
            r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
        ];

        for path in &candidates {
            if std::path::Path::new(path).exists() {
                println!("🚀 Launching standalone desktop window via {}...", path);
                let child = Command::new(path)
                    .arg(format!("--app={}", url))
                    .arg(format!("--user-data-dir={}", user_data_str))
                    .arg("--window-size=1340,880")
                    .arg("--enable-gpu-rasterization")
                    .arg("--enable-zero-copy")
                    .arg("--force-dark-mode")
                    .spawn();
                if let Ok(proc) = child {
                    return Some(proc);
                }
            }
        }

        // Try searching PATH for msedge / chrome / brave
        for exe in ["msedge.exe", "chrome.exe", "brave.exe"] {
            let child = Command::new(exe)
                .arg(format!("--app={}", url))
                .arg(format!("--user-data-dir={}", user_data_str))
                .arg("--window-size=1340,880")
                .arg("--enable-gpu-rasterization")
                .arg("--enable-zero-copy")
                .arg("--force-dark-mode")
                .spawn();
            if let Ok(proc) = child {
                return Some(proc);
            }
        }

        // Fallback: open default browser via cmd start
        println!("⚠️ Dedicated browser not found, launching default browser...");
        let _ = Command::new("cmd").args(["/C", "start", url]).spawn();
        None
    }

    #[cfg(not(windows))]
    {
        let browsers = [
            "chromium-browser",
            "chromium",
            "google-chrome",
            "google-chrome-stable",
            "brave-browser",
            "microsoft-edge",
        ];

        let temp_dir = std::env::temp_dir();
        let user_data = temp_dir.join("soundcloud-desktop-profile");
        let user_data_str = user_data.to_string_lossy().to_string();

        for browser in browsers {
            if let Ok(path) = which(browser) {
                println!("🚀 Launching standalone desktop window via {}...", browser);
                let child = Command::new(path)
                    .arg(format!("--app={}", url))
                    .arg(format!("--user-data-dir={}", user_data_str))
                    .arg("--window-size=1340,880")
                    .arg("--enable-gpu-rasterization")
                    .arg("--enable-zero-copy")
                    .arg("--force-dark-mode")
                    .spawn();

                if let Ok(proc) = child {
                    return Some(proc);
                }
            }
        }

        // Fallback: system default browser via xdg-open
        println!("⚠️ Dedicated browser not found, falling back to xdg-open...");
        Command::new("xdg-open").arg(url).spawn().ok()
    }
}

#[cfg(not(windows))]
fn which(cmd: &str) -> Result<String, ()> {
    if let Ok(output) = Command::new("which").arg(cmd).output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return Ok(path);
            }
        }
    }
    Err(())
}
