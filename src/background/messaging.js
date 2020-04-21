/**
 * Facilitate messaging between the extension and content scripts through the window.
 */
chrome.runtime.onMessage.addListener(async function (request) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
});