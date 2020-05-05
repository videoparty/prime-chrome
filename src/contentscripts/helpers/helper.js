/**
 * Breaks down a detail URL into three parts:
 * https://www.primevideo.com/detail/{VIDEOID}/ref={REF}?autoplay=1&t={TIME}
 */
function splitPlayUrl(url) {
    const splittedUrl = url.match(/detail\/([0-9A-Z]+).+ref=(\w+)(?:.*&t=(\d+))?/);
    if (splittedUrl === null) {
        return null
    }

    return {
        videoId: splittedUrl[1],
        ref: splittedUrl[2],
        time: splittedUrl[3]
    }
}

/**
 * Get the 'pvpartyId' query parameter from current window URL
 * @returns {string|undefined}
 */
function getPartyQueryParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const partyId = urlParams.get('pvpartyId');
    if (partyId && partyId.length === 5 && (!currentParty || currentParty.id !== partyId)) {
        return partyId;
    }
    return undefined;
}

/**
 * If this is false, it means that the user did not
 * open the extension. The user is watching
 * something alone without a party.
 * @returns {boolean}
 */
function partyIsEnabled() {
    return socket !== undefined;
}

/**
 * Get displayname synchroneously
 * by querying the backend service.
 */
async function getDisplayName() {
    return new Promise((resolve) => {
        const listener = function (ev) {
            if (ev.data.type === 'displayname') {
                window.removeEventListener('message', listener);
                resolve(ev.data.displayName);
            }
        };
        window.addEventListener('message', listener, false);
        chrome.runtime.sendMessage({type: 'get-displayname'});
    })
}