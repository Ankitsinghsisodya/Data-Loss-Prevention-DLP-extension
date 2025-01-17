import React, { useState, useEffect } from "react";

function App() {
  const [blockedExtensions, setBlockedExtensions] = useState([]);
  const [allowedWebsites, setAllowedWebsites] = useState([]);
  const [newWebsite, setNewWebsite] = useState("");
  const [ext, setExt] = useState("");
  
  useEffect(() => {
    chrome.storage.sync.get(
      ["blockedExtensions", "allowedWebsites"],
      (data) => {
        setBlockedExtensions(data.blockedExtensions || ["pdf", "docx", "xls"]);
        setAllowedWebsites(data.allowedWebsites || []);

        // Update rules with default extensions
        chrome.runtime.sendMessage({
          type: "UPDATE_RULES",
          fileExtensions: data.blockedExtensions || ["pdf", "docx", "xls"],
        });
      }
    );
  }, []);

  const removeWebsite = (siteToRemove) => {
    const updatedSites = allowedWebsites.filter(
      (site) => site !== siteToRemove
    );
    setAllowedWebsites(updatedSites);
    // Notify background script
    chrome.runtime.sendMessage({
      type: "UPDATE_ALLOWED_SITES",
      sites: updatedSites,
    });
  };
  const addAllowedWebsite = () => {
    if (newWebsite) {
      const updatedSites = [...allowedWebsites, newWebsite];
      setAllowedWebsites(updatedSites);
      // Notify background script
      chrome.runtime.sendMessage({
        type: "UPDATE_ALLOWED_SITES",
        sites: updatedSites,
      });
      console.log(allowedWebsites);
      setNewWebsite("");
    }
  };
  const toggle = async (ext) => {
    const updatedExtensions = blockedExtensions.includes(ext)
      ? blockedExtensions.filter((e) => e !== ext)
      : [...blockedExtensions, ext];

    await setBlockedExtensions(updatedExtensions);
    await chrome.storage.sync.set({ blockedExtensions: updatedExtensions });
    chrome.storage.sync.set(
      {
        blockedExtensions: updatedExtensions,
      },
      () => {
        chrome.runtime.sendMessage({
          type: "UPDATE_RULES",
          fileExtensions: blockedExtensions,
        });
      }
    );
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
      console.log("Dynamic Rules:", rules);
    });

    chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
      console.log("Enabled Rulesets:", rulesets);
    });
  };
  return (
    <div className="container p-4 bg-gradient-to-r from-indigo-500 w-full">
      <h1 className="text-xl mb-2 font-extrabold">DLP Settings</h1>

      <div className="mb-2">
        <h2 className="text-lg font-extrabold">Blocked File Types</h2>
        <div className="pl-5 flex justify-between flex-wrap">
          {blockedExtensions.map((ext) => (
            <div key={ext} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`ext-${ext}`}
                checked={blockedExtensions.includes(ext)}
                onChange={() => toggle(ext)}
                className="form-checkbox"
              />
              <label htmlFor={`ext-${ext}`} className="font-bold">
                {ext}
              </label>
            </div>
          ))}
        </div>

        <div className="flex gap-2 my-2">
          <input
            type="text"
            value={ext}
            onChange={(e) => setExt(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
            placeholder="Enter the extensions"
          />
          <button
            onClick={() => {
              toggle(ext);
              setExt("");
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Allowed Websites</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
            placeholder="Enter website domain"
          />
          <button
            onClick={addAllowedWebsite}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto border rounded p-2 min-h-10">
          <ul className="divide-y">
            {allowedWebsites.map((site) => (
              <li
                key={site}
                className="py-2 px-1 flex justify-between items-center hover:bg-gray-50"
              >
                <button
                  onClick={() => removeWebsite(site)}
                  className="text-red-500 hover:text-red-600 mr-3 w-2 h-6"
                >
                  ×
                </button>
                <span>{site}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
