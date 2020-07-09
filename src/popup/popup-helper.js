/**
 * Create new party and join it
 * @param sendToContentScript to send a message to the contentscript
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
