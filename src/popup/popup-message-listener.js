/**
 * Listen to all incoming contentscript messages
 */
chrome.runtime.onMessage.addListener(async function (msg) {
    postWindowMessage(msg);
});

// Copy party link button shows "Copied!"
listenToWindowEvent('copy-confirm', () => {
    confirmCodeCopy();
});

// Updated party
listenToWindowEvent('party-info', (ev) => {
    $('#party-code').val(ev.data.partyId);
    $('#copy-party-link').css('display', 'inline-block');
});

// Displayname change
listenToWindowEvent('displayname', (ev) => {
    $('#displayname-text').val(ev.data.displayName);
});