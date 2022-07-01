
//We're getting the url of the tab we are so we can check if it belongs to youtube.com then we create a URL object and send this object with the tab id and info to the contentScript.js using sendMessage. 

chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("youtube.com/watch")) {
        const queryParameters = tab.url.split("?")[1];
        const urlParameters = new URLSearchParams(queryParameters);

        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: urlParameters.get("v")
        });
    }
});

