/**
 * Check if the user is joining a party through the URL.
 * Otherwise try to obtain party data from the extension.
 */

const joinPartyId = getPartyQueryParameter();

if (joinPartyId) {
    chrome.runtime.sendMessage({type: 'join-party', partyId: joinPartyId});
} else {
    chrome.runtime.sendMessage({type: 'get-party', createNew: false});
}