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
        case 'bg:set-displayname':
            setDisplayName(request.displayName);
            break;
        case 'get-displayname':
            getDisplayName();
            break;
        case 'join-party':
            joinParty(request.partyId);
            break;
        case 'set-review-status':
            setStoreReviewStatus(request.status);
            break;
    }
});

chrome.runtime.onStartup.addListener(async function() {
    // Reset current party on browser startup
    leaveParty();

    // And set PvP usage data (for store review)
    const displayName = await getDisplayName();
    const storeReviewStatus = await getStoreReviewStatus();
    if (!displayName && !storeReviewStatus) {
        // New installation, set the review status to later
        // TODO remove this after a few weeks, hopefully we've asked all existing users by then
        setStoreReviewStatus('later');
    }
});

function setCurrentParty(party) {
    chrome.storage.local.set({ currentParty: party });
}

function setDisplayName(name) {
    chrome.storage.local.set({ displayName: name });
}

/**
 * Set store review status for one of three:
 * undefined - not asked for feedback before, or no response
 * 'done' - opened store page
 * 'no' - user does not want to give feedback, do not ask again
 * 'later' - ask again after 3 times the tab was closed
 */
async function setStoreReviewStatus(status, askAgainAfter = 3) {
    let laterCount = undefined;
    if (status === 'later') {
        const pvpUsedCount = await getAmountOfPvPUsed();
        laterCount = pvpUsedCount + askAgainAfter;
    }
    chrome.storage.local.set({ storeReviewStatus: {status, laterCount} });
}

/**
 * Set store review status for one of three:
 * undefined - not asked for feedback before, or no response
 * 'done' - opened store page
 * 'no' - user does not want to give feedback, do not ask again
 * 'later-{number}' - ask again after PvpUsed counter is higher than the number
 * @returns {status: string, laterCount: number}
 */
function getStoreReviewStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get('storeReviewStatus', function(result) {
            resolve(result.storeReviewStatus);
        });
    })
}

/**
 * Get whether we are ready to ask the
 * user for a webstore review.
 * @returns {browser: string, readyToAsk: bool}
 */
async function isReadyForStoreReview() {
    const storeReviewStatus = await getStoreReviewStatus();
    const pvpUsedCount = await getAmountOfPvPUsed();
    let isReady = true;

    // Not ready if the user already reviewed or does not want to review
    if (storeReviewStatus !== undefined
        && (storeReviewStatus.status === 'no' || storeReviewStatus.status === 'done')) {
        isReady = false;
    // Not ready in case of a new installation or user postponed
    } else if (storeReviewStatus !== undefined && storeReviewStatus.status === 'later'
        && pvpUsedCount < storeReviewStatus.laterCount) {
        isReady = false;
    }

    return {browser: 'chrome', readyToAsk: isReady} // TODO support edge
}

/**
 * Every time the window closes and the user was in a party,
 * the PvP usage counter increases. This is registered so
 * we can ask the user for a store review after regular usage.
 */
async function increaseAmountOfPvPUsed() {
    const count = await getAmountOfPvPUsed();
    chrome.storage.local.set({ pvpUsed: count + 1 });
}

/**
 * Every time the window closes and the user was in a party,
 * the PvP usage counter increases.
 * @since v0.8.6
 * @returns Promise (resolving either in undefined or a object with a number)
 */
function getAmountOfPvPUsed() {
    return new Promise((resolve) => {
        chrome.storage.local.get('pvpUsed', function(result) {
            resolve(result.pvpUsed ? result.pvpUsed : 0);
        });
    })
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
 * @returns Promise<string>
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
            partyId: currentParty.partyId,
            askForStoreReview: await isReadyForStoreReview(),
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
 * Generate new party and resets the current party
 * @returns {{partyId: string}}
 */
async function createNewParty(joinPartyId = undefined) {
    const partyId = joinPartyId || generatePartyId();
    const newPartyMsg = {
        type: 'party-info',
        partyId,
        askForStoreReview: await isReadyForStoreReview(),
        isNew: true
    };

    chrome.tabs.onRemoved.addListener(() => leaveParty(true));

    setCurrentParty({partyId});
    broadcastMessage(newPartyMsg);

    return newPartyMsg;
}

function leaveParty(closeTab = false) {
    if (closeTab) {
        increaseAmountOfPvPUsed();
    }
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
