// SoundCloud Ultimate Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SoundCloud Ultimate] Extension installed successfully.');
});

// Relay commands from hotkeys or popup if necessary
chrome.commands?.onCommand?.addListener((command) => {
  console.log('[SoundCloud Ultimate] Received command:', command);
});
