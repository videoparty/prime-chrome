/**
 * Listen to all incoming contentscript messages
 */
chrome.runtime.onMessage.addListener(async function (msg) {
    postWindowMessage(msg, '*');
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
 * Get current party info.
 * Background service will kick
 * off a 'party-info' event.
 */
function getCurrentParty() {
    sendMessageToRuntime({type: 'get-party', createNew: true});
}

/**
 * Get current displayname
 * Background service will kick
 * off a 'displayname' event.
 */
function getDisplayName() {
    sendMessageToRuntime({type: 'get-displayname'});
}

/**
 * Set current displayname
 * Background service will kick
 * off a 'displayname' event.
 */
function setDisplayName(name) {
    sendMessageToRuntime({type: 'set-displayname', displayName: name});
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