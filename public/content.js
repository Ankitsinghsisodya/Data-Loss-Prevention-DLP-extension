function getBaseDomain(url) {
  try {
    // Extract the hostname from the URL
    const hostname = new URL(url).hostname;

    // Split the hostname into parts
    const parts = hostname.split(".");

    // If it's a subdomain (e.g., api82.ilovepdf.com), take the last two parts
    if (parts.length > 2) {
      return parts.slice(-2).join(".");
    }

    // Otherwise, return the hostname itself (e.g., ilovepdf.com)
    return hostname;
  } catch (error) {
    console.error("Invalid URL:", url);
    return null;
  }
}

function isSameBaseDomain(url1, url2) {
  const domain1 = getBaseDomain(url1);
  const domain2 = getBaseDomain(url2);

  if (domain1 && domain2) {
    return domain1 === domain2;
  }

  return false;
}

function checkAndDisableElements() {
  chrome.storage.sync.get(["allowedWebsites"], (data) => {
    const allowedWebsites = data.allowedWebsites || [];
    const currentHostname = window.location;

    const isAllowed = allowedWebsites.some(
      (site) => isSameBaseDomain(currentHostname, site) 
    );

  
    if (!isAllowed) {
      document
        .querySelectorAll("input, textarea, select, button")
        .forEach((element) => {
          element.disabled = true;
          element.style.opacity = "0.5";
        });
    }
  });

}
// Message Listener
// Message Listener for download blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  if (message.type === "BLOCK_UPLOAD") {
    // Create alert dialog
    alert(`Unwanted upload was prevented`);
    
    // // Create visual notification
    // const notification = document.createElement('div');
    // notification.style.cssText = `
    //   position: fixed;
    //   top: 20px;
    //   right: 20px;
    //   background: #ff4444;
    //   color: white;
    //   padding: 15px;
    //   border-radius: 4px;
    //   z-index: 9999;
    //   box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    // `;
    // // notification.textContent = message.message;
    // document.body.appendChild(notification);

    // // Remove notification after 5 seconds
    // setTimeout(() => notification.remove(), 5000);

    // Send success response
    sendResponse({ success: true });
  }
  return true; // Keep message channel open
});
// Run on page load
checkAndDisableElements();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.allowedWebsites) {
    console.log('Allowed websites updated:', changes.allowedWebsites.newValue);
    checkAndDisableElements();
  }
});

// Watch for DOM changes
const observer = new MutationObserver(() => {
  checkAndDisableElements();
});

// Start observing
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
