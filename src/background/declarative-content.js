// Make sure the extension shows it's content for only matching URL's.
var rule = {
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: '.primevideo.com', schemes: ['https'] }
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: '.amazon.com', schemes: ['https'] }
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: '.amazon.co.uk', schemes: ['https'] }
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: '.amazon.de', schemes: ['https'] }
        }),
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: '.amazon.co.jp', schemes: ['https'] }
        })
    ],
    actions: [ new chrome.declarativeContent.ShowPageAction() ]
};

chrome.runtime.onInstalled.addListener(function(_) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([rule]);
    });
});