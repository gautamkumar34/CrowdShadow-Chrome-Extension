// CrowdShadow/background.js

// Function to fetch Hacker News data
async function fetchHNData(query) {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60}`; // Search for stories in the last year
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        }
        const data = await response.json();
        return Array.isArray(data.hits) ? data.hits.map(hit => ({
            title: hit.title,
            url: hit.url,
            points: hit.points,
            num_comments: hit.num_comments,
            objectID: hit.objectID 
        })) : [];
    } catch (error) {
        throw error;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let isAsync = false;

    if (request.action === "fetchHNData") {
        const query = request.query;
        fetchHNData(query)
            .then(data => {
                sendResponse({ success: true, data: data });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message || "Unknown error" });
            });
        isAsync = true;
    } else if (request.action === "getCurrentTabInfo") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                return;
            }
            if (tabs[0]) {
                sendResponse({ success: true, url: tabs[0].url, title: tabs[0].title });
            } else {
                sendResponse({ success: false, error: "No active tab found." });
            }
        });
        isAsync = true;
    } else if (request.action === "closeSidebarFromSidebar") {
        if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "closeSidebarFromBackground" })
        }
    } else if (request.action === "toggleSidebar") {
        if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "toggleSidebar" })
        }
    }

    return isAsync;
});

const sendUrlChangedMessage = (tabId, url, title, attempt = 1) => {
    const delay = attempt === 1 ? 50 : 0;

    setTimeout(() => {
        chrome.tabs.sendMessage(tabId, {
            action: "urlChanged",
            url: url,
            title: title
        }).catch(error => {
            if (error.message.includes("Could not establish connection") || error.message.includes("Receiving end does not exist")) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }).then(() => {
                    return sendUrlChangedMessage(tabId, url, title, attempt + 1);
                })
            } 
        });
    }, delay);
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.active) {
        if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("about:")) {
            return;
        }
        sendUrlChangedMessage(tabId, tab.url, tab.title);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab && tab.url) {
            if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("about:")) {
                return;
            }
            sendUrlChangedMessage(tab.id, tab.url, tab.title);
        }
    });
});