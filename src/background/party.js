let currentParty;

/**
 * Listen to incoming party-related messages
 * from contentscript or popup.
 */
chrome.runtime.onMessage.addListener(async function (request) {
    switch (request.type) {
        case 'create-new-party':
            createNewParty();
            break;
        case 'get-party':
            getParty(true, request.createNew);
            break;
        case 'join-party':
            joinParty(request.partyId);
            break;
    }
});

/**
 * Get current party ID.
 * If there is no current party, make a new one.
 */
function getParty(broadcast, createIfUndefined) {
    if (!currentParty && createIfUndefined) {
        createNewParty();
    } else if (currentParty && broadcast) {
        broadcastMessage({
            type: 'party-info',
            link: currentParty.link,
            partyId: currentParty.partyId,
            isNew: false
        });
    }

    return currentParty;
}

/**
 * Update current party
 */
function joinParty(partyId) {
    if (currentParty.partyId !== partyId) {
        createNewParty(partyId);
    } else {
        getParty(true);
    }
}

/**
 * Generate new party link and resets the current party
 * @returns {{partyId: string, link: string}}
 */
function createNewParty(joinPartyId = undefined) {
    const partyId = joinPartyId || generatePartyId();
    const partyLink = 'https://primevideo.com/?pvpartyId=' + partyId;
    const newPartyMsg = {
        type: 'party-info',
        link: partyLink,
        partyId,
        isNew: true
    };

    currentParty = {link: partyLink, partyId};

    broadcastMessage(newPartyMsg);

    return newPartyMsg;
}

/**
 * Random partycode generator
 */
function generatePartyId(length = 5) {
    const characters = 'ABCDEFGHKLMNPQRSTUVWXYZ123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Broadcast message to content scripts and extension
 */
function broadcastMessage(data) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, data);
        }
    });
    chrome.runtime.sendMessage(data);
}