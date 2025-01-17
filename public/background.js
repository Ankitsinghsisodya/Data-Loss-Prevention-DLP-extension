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
  console.log(url1);
  console.log(url2);
  const domain1 = getBaseDomain(url1);
  const domain2 = getBaseDomain(url2);
  console.log("domain1", domain1);
  console.log(" ");
  console.log("domain2", domain2);
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
     

      const fileExtension = downloadItem?.mime.split("/")[1].toLowerCase();
      console.log('donwloadItem', downloadItem);
      // Check if extension is blocked
      console.log('downloadUrl', downloadURL);
      let isBlockedExtension = false;
      if (fileExtension)
        isBlockedExtension = data.blockedExtensions.some(
          (extension) => extension === fileExtension
        );
      console.log(data.blockedExtensions);
      console.log(fileExtension);
      console.log(isBlockedExtension);
      console.log("isAllowedSite", isAllowedSite);
      console.log(downloadURL);
      if (!isAllowedSite && isBlockedExtension)
        if (downloadURL) {
          chrome.downloads.cancel(downloadItem.id);
          // alert('download nahi hoga');
          await chrome.notifications.create({
            type: "basic",
            title: "Download Blocked",
            message: `Downloads not allowed from ${downloadURL}`,
            iconUrl: "icons/icon48.png",
          });
        }
    }
  );
});

// background.js

function updateDynamicRules(blockedExtensions = []) {
  // Start IDs from 1000 to avoid conflicts
  const baseId = 1000;

  const rules = blockedExtensions.map((ext, index) => ({
    id: baseId + index,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "*",
      resourceTypes: ["xmlhttprequest", "sub_frame", "other"],
      requestMethods: ["post", "put"],
      regexFilter: `\\.${ext}$`,
    },
  }));

  // Get and remove all existing dynamic rules
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const existingRuleIds = existingRules.map((rule) => rule.id);
    console.log("Removing existing rules:", existingRuleIds);
    console.log("Adding new rules", rules);

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: existingRuleIds,
        addRules: rules,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Rule update failed:", chrome.runtime.lastError);
        } else {
          console.log("New rules added:", rules);
          // Store current rule IDs
          chrome.storage.sync.set({
            activeRuleIds: rules.map((rule) => rule.id),
          });
        }
      }
    );
  });
  chrome.declarativeNetRequest.getDynamicRules(async (existingRules) => {
    const newRuleIds = await existingRules.map((rule) => rule.id);
    console.log(newRuleIds);
  });
}

// Listen for rule update requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_RULES") {
    console.log("Updating rules with extensions:", message.fileExtensions);
    updateDynamicRules(message.fileExtensions);
    sendResponse({ success: true });
    return true;
  }
});
