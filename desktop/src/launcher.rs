use std::process::{Child, Command};

pub fn launch_desktop_window(url: &str) -> Option<Child> {
    let browsers = [
        "chromium-browser",
        "chromium",
        "google-chrome",
        "google-chrome-stable",
        "brave-browser",
        "microsoft-edge",
    ];

    let user_data = "/tmp/soundcloud-desktop-profile";

    for browser in browsers {
        if let Ok(path) = which(browser) {
            println!("🚀 Launching standalone desktop window via {}...", browser);
            let child = Command::new(path)
                .arg(format!("--app={}", url))
                .arg(format!("--user-data-dir={}", user_data))
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
