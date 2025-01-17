chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    blockedExtensions: ["pdf", "docx", "xlsx", "xls"],
    allowedWebsites: [],
    isEnabled: true,
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const currentURL = sender?.tab?.url ? new URL(sender.tab.url).hostname : null;

  if (message.type === "CHECK_SITE" && currentURL) {
    console.log("aayi aapka swagat h");
    chrome.storage.sync.get(
      ["blockedExtensions", "allowedWebsites"],
      async (data) => {
        const isAllowedSite = data.allowedWebsites.some((site) =>
          //   currentURL.includes(site)
          site.includes(currentURL)
        );

        if (!isAllowedSite)
          if (data.blockedExtensions.includes(message.extension)) {
            // Notify content script to prevent upload

            await chrome.tabs.sendMessage(sender.tab.id, {
              type: "BLOCK_UPLOAD",
              fileType: message.extension,
              reason: !isAllowedSite
                ? "Unauthorized website"
                : "Blocked file type",
            });

            // Show notification
            await chrome.notifications.create({
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

chrome.downloads.onCreated.addListener((downloadItem) => {
  chrome.storage.sync.get(
    ["allowedWebsites", "blockedExtensions"],
    async (data) => {
      const downloadURL = downloadItem?.url;
      let isAllowedSite = false;
      if (downloadURL) {
        for (const element of data.allowedWebsites) {
          if (isSameBaseDomain(downloadURL, element)) isAllowedSite = true;
        }
      }

      let fileExtension;
      if (downloadItem.filename) {
        fileExtension = downloadItem.filename.split(".").pop().toLowerCase();
      } else if (downloadItem.mime) {
        // Fallback to MIME type
        const mimeMap = {
          // Common document types
          "application/pdf": "pdf",
          "application/msword": "doc",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            "docx",

          // Spreadsheet types
          "application/vnd.ms-excel": "xls",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            "xlsx",

          // Other common types
          "application/zip": "zip",
          "application/x-rar-compressed": "rar",
          "text/plain": "txt",
          "image/jpeg": "jpg",
          "image/png": "png",
        };

        fileExtension =
          mimeMap[downloadItem.mime] || downloadItem.mime.split("/")[1];
      }

      // Check if extension is blocked
      console.log("fileExtension", fileExtension);
      let isBlockedExtension = false;
      if (fileExtension) {
        for (const element of data.blockedExtensions) {
          if (element === fileExtension) isBlockedExtension = true;
        }
      }
      // console.log('isBlockedExtension', isBlockedExtension)
      // console.log('isBlockedExtension', isBlockedExtension)
      if (!isAllowedSite && isBlockedExtension)
        if (downloadURL) {
          chrome.downloads.cancel(downloadItem.id);
          // alert('download nahi hoga');
          chrome.runtime.sendMessage({
            type: "BLOCK_UPLOAD",
            title: "Download Blocked",
            message: `Downloads not allowed from ${downloadURL}`,
            iconUrl: "icons/icon48.png",
          });
        }
    }
  );
});


