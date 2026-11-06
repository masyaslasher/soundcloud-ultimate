use std::process::{Child, Command};
use tao::{
    dpi::LogicalSize,
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::{Icon, WindowBuilder},
};
use wry::WebViewBuilder;

#[cfg(target_os = "linux")]
use tao::platform::unix::WindowExtUnix;
#[cfg(target_os = "linux")]
use wry::WebViewBuilderExtUnix;

fn load_icon() -> Option<Icon> {
    let bytes = include_bytes!("../assets/icon.png");
    let img = image::load_from_memory(bytes).ok()?.to_rgba8();
    let (width, height) = img.dimensions();
    Icon::from_rgba(img.into_raw(), width, height).ok()
}

pub fn run_native_window(url: &str) -> Result<(), Box<dyn std::error::Error>> {
    println!("🖥️  Creating native standalone window (Tao + Wry)...");
    let event_loop = EventLoop::new();

    let mut builder = WindowBuilder::new()
        .with_title("SoundCloud Ultimate")
        .with_inner_size(LogicalSize::new(1340.0, 880.0))
        .with_min_inner_size(LogicalSize::new(960.0, 640.0));

    if let Some(icon) = load_icon() {
        builder = builder.with_window_icon(Some(icon));
    }

    let window = builder.build(&event_loop)?;

    let webview_builder = WebViewBuilder::new()
        .with_url(url)
        .with_devtools(true);

    #[cfg(target_os = "linux")]
    let _webview = if let Some(vbox) = window.default_vbox() {
        webview_builder.build_gtk(vbox)?
    } else {
        webview_builder.build_gtk(window.gtk_window())?
    };

    #[cfg(not(target_os = "linux"))]
    let _webview = webview_builder.build(&window)?;

    println!("✨ Standalone native desktop window created successfully.");

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        if let Event::WindowEvent {
            event: WindowEvent::CloseRequested,
            ..
        } = event
        {
            println!("🚪 Window closed by user. Exiting application...");
            *control_flow = ControlFlow::Exit;
        }
    });

}

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
    if let Ok(output) = Command::new("which").arg(cmd).output()
        && output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                return Ok(path);
            }
        }
    Err(())
}
