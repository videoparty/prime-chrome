/**
 * Listen to incoming party-related messages
 * from contentscript or popup.
 */
chrome.runtime.onMessage.addListener(function (request) {
    switch (request.type) {
        case 'create-new-party':
            createNewParty(request.url);
            break;
        case 'get-party':
            getParty(request.url, true, request.createNew);
            break;
        case 'bg:set-displayname':
            setDisplayName(request.displayName);
            break;
        case 'get-displayname':
            getDisplayName();
            break;
        case 'join-party':
            joinParty(request.url, request.partyId);
            break;
    }
});

/**
 * Reset current party on browser startup
 */
chrome.runtime.onStartup.addListener(function() {
    leaveParty();
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
async function getParty(url, broadcast, createIfUndefined) {
    const currentParty = await getCurrentParty();
    if (!currentParty && createIfUndefined) {
        createNewParty(url);
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
async function joinParty(url, partyId) {
    const currentParty = await getCurrentParty();
    if (!currentParty || currentParty.partyId !== partyId) {
        createNewParty(url, partyId);
    } else {
        await getParty(url, true);
    }
}

/**
 * Generate new party link and resets the current party
 * @returns {{partyId: string, link: string}}
 */
function createNewParty(url, joinPartyId = undefined) {
    const partyId = joinPartyId || generatePartyId();
    const partyLink = getCurrentTabBaseUrl(url) +'/?pvpartyId=' + partyId;
    const newPartyMsg = {
        type: 'party-info',
        link: partyLink,
        partyId,
        isNew: true
    };

    chrome.tabs.onRemoved.addListener(() => leaveParty());

    setCurrentParty({link: partyLink, partyId});
    broadcastMessage(newPartyMsg);

    return newPartyMsg;
}

function leaveParty() {
    chrome.storage.local.remove('currentParty');
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

function getCurrentTabBaseUrl(fullUrl) {
    let url = new URL(fullUrl).origin;
    if (url.includes('amazon.')) {
        url += '/gp/video/storefront'
    }
    return url;
}
