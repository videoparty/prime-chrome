/**
 * Listen to all incoming contentscript messages
 */
chrome.runtime.onMessage.addListener(async function (msg) {
    window.postMessage(msg, '*');
});

/**
 * Sends a message to the background scripts and/or content script(s)
 */
function sendMessageToRuntime(data) {
    chrome.runtime.sendMessage(data);
}

/**
 * Create new party and join it
 * @param sendToContentScript to send a message to the contentscript
 * @returns {{code: string, link: string}}
 */
function createAndJoinNewParty(sendToContentScript = true) {
    sendMessageToRuntime({type: 'create-new-party'});
}

/**
 * Get current party info
 * @returns {{code: string, link: string}}
 */
function getCurrentParty() {
    sendMessageToRuntime({type: 'get-party', createNew: true});
}

/**
 * Copy the .val() of a given selector
 * to the clipboard.
 */
function copyValToClipboard(selector) {
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(selector).val()).select();
    document.execCommand("copy");
    $temp.remove();
}