/**
 * Check if the user is joining a party through the URL.
 * Otherwise try to obtain party data from the extension.
 */
const joinPartyId = getPartyQueryParameter();
if (joinPartyId) {
    sendMessageToRuntime({type: 'join-party', partyId: joinPartyId});
} else {
    sendMessageToRuntime({type: 'get-party', createNew: false});
}
