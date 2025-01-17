import React, { useState, useEffect } from "react";

function App() {
  const [blockedExtensions, setBlockedExtensions] = useState([]);
  const [allowedWebsites, setAllowedWebsites] = useState([]);
  const [newWebsite, setNewWebsite] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(
      ["blockedExtensions", "allowedWebsites"],
      (data) => {
        setBlockedExtensions(data.blockedExtensions || []);
        setAllowedWebsites(data.allowedWebsites || []);
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

  return (
    <div className="container p-4 bg-gradient-to-r from-indigo-500 w-full">
      <h1 className="text-xl mb-2 font-extrabold">DLP Settings</h1>

      <div className="mb-2">
        <h2 className="text-lg font-extrabold">Blocked File Types</h2>
        <ul className=" pl-5 flex  justify-between">
          {blockedExtensions.map((ext) => (
            <li key={ext} className="font-bold">
              {ext}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">Allowed Websites</h2>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className="border p-1 rounded-xl"
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
                <span>{site}</span>
                <button
                  onClick={() => removeWebsite(site)}
                  className="text-red-500 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
