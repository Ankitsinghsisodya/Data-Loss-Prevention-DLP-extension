// Get allowed websites from chrome storage
chrome.storage.sync.get(["allowedWebsites"], (data) => {
  const allowedWebsites = data.allowedWebsites || [];
  const currentHostname = window.location.hostname;

  // Check if current site is allowed
  const isAllowed = allowedWebsites.some(
    (site) => currentHostname === site || currentHostname.endsWith(`.${site}`)
  );

  // Disable all interactive elements if site is not allowed
  if (!isAllowed) {
    document
      .querySelectorAll("input, textarea, select, button")
      .forEach((element) => {
        element.disabled = true;
        element.style.opacity = "0.5";
      });
  }
});

// Message Listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.type === "BLOCK_UPLOAD" || message.type === "showNotification") {
    try {
      console.log('Showing alert for:', message);
      alert(message.reason || message.message || 'File operation was blocked');
      sendResponse({ success: true });
    } catch (error) {
      console.error('Failed to show alert:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep message channel open
});