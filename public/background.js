chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    blockedExtensions: ["pdf", "docx", "xlsx", "xls"],
    allowedWebsites: [],
    isEnabled: true,
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const currentURL = sender?.tab?.url ? new URL(sender.tab.url).hostname : null;

  if (message.type === "FILE_SELECTED" && currentURL) {
    chrome.storage.sync.get(
      ["blockedExtensions", "allowedWebsites"],
      (data) => {
        const isAllowedSite = data.allowedWebsites.some((site) =>
          //   currentURL.includes(site)
          site.includes(currentURL)
        );
        console.log(isAllowedSite);
        // Block if site not allowed or extension is blocked
        if (!isAllowedSite)
          if (data.blockedExtensions.includes(message.extension)) {
            // Notify content script to prevent upload
            chrome.tabs.sendMessage(sender.tab.id, {
              type: "BLOCK_UPLOAD",
              fileType: message.extension,
              reason: !isAllowedSite
                ? "Unauthorized website"
                : "Blocked file type",
            });

            // Show notification
            chrome.notifications.create({
              type: "basic",
              title: "File Operation Blocked",
              message: !isAllowedSite
                ? `${currentURL} is not authorized for file operations`
                : `Cannot upload .${message.extension} files`,
              iconUrl: "icons/icon48.png",
            });

            sendResponse({ blocked: true });
          } else {
            sendResponse({ blocked: false });
          }
      }
    );
    return true; // Keep message channel open
  }

  if (message.type === "UPDATE_ALLOWED_SITES") {
    // Update storage
    chrome.storage.sync.set({ allowedWebsites: message.sites }, () => {
      // Refresh active tab to apply new rules
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
      sendResponse({ success: true });
    });
    return true; // Keep message channel open
  }
});

chrome.downloads.onCreated.addListener((downloadItem) => {
  chrome.storage.sync.get(["allowedWebsites"], (data) => {
    const downloadURL = downloadItem?.url
      ? new URL(downloadItem.url).hostname
      : null;
    let isAllowedSite = false;
    if (downloadURL)
      isAllowedSite = data.allowedWebsites.some((site) =>
        site.includes(downloadURL)
      );

    data.allowedWebsites.forEach((element) => {
      console.log(element);
      console.log(downloadURL);
    });
    if (!isAllowedSite)
      if (downloadURL) {
        console.log(isAllowedSite);
        chrome.downloads.cancel(downloadItem.id);
        // alert('download nahi hoga');
        chrome.notifications.create({
          type: "basic",
          title: "Download Blocked",
          message: `Downloads not allowed from ${downloadURL}`,
          iconUrl: "icons/icon48.png",
        });
      }
  });
});
