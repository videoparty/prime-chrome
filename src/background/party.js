/**
 * Listen to incoming party-related messages
 * from contentscript or popup.
 */
chrome.runtime.onMessage.addListener(function (request) {
    switch (request.type) {
        case 'create-new-party':
            createNewParty();
            break;
        case 'get-party':
            getParty(true, request.createNew);
            break;
        case 'set-displayname':
            setDisplayName(request.displayName);
            break;
        case 'get-displayname':
            getDisplayName();
            break;
        case 'join-party':
            joinParty(request.partyId);
            break;
    }
});

/**
 * Reset current party on browser startup
 */
chrome.runtime.onStartup.addListener(function() {
    console.log('Reset party');
    chrome.storage.local.remove('currentParty');
});

function setCurrentParty(party) {
    chrome.storage.local.set({ currentParty: party });
}

function setDisplayName(name) {
    chrome.storage.local.set({ displayName: name });
}

/**
 * @returns Promise (resolving either in undefined or a object with link and partyId)
 */
function getCurrentParty() {
    return new Promise((resolve) => {
        chrome.storage.local.get('currentParty', function(result) {
            resolve(result.currentParty);
        });
    })
}

/**
 * @returns Promise
 */
function getDisplayName(broadcast = true) {
    return new Promise((resolve) => {
        chrome.storage.local.get('displayName', function(result) {
            if (broadcast) {
                broadcastMessage({type: 'displayname', displayName: result.displayName});
            }
            resolve(result.displayName);
        });
    })
}

/**
 * Get current party ID.
 * If there is no current party, make a new one.
 */
async function getParty(broadcast, createIfUndefined) {
    const currentParty = await getCurrentParty();
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
async function joinParty(partyId) {
    const currentParty = await getCurrentParty();
    if (!currentParty || currentParty.partyId !== partyId) {
        createNewParty(partyId);
    } else {
        await getParty(true);
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

    setCurrentParty({link: partyLink, partyId});
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