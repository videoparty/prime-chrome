/**
 * Listen to a specific window event.
 * An optional timeout delays calling the callback function.
 */
function listenToWindowEvent(type, callback, timeout = 1) {
    window.addEventListener('message', function (ev) {
        if (ev.data.type === type) {
            setTimeout(() => {
                callback(ev)
            }, timeout);
        }
    }, false);
}

/**
 * Breaks down a detail URL into three parts:
 * https://www.primevideo.com/detail/{VIDEOID}/ref={REF}?autoplay=1&t={TIME}
 */
function splitPlayUrl(url) {
    const splittedUrl = url.match(/detail\/([0-9A-Z]+).+ref=(\w+)(?:.*&t=(\d+))?/);
    if (splittedUrl === null) {return null}

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
    if (partyId && partyId.length > 0 && partyId.length < 6 && currentPartyId !== partyId) {
        return partyId;
    }
    return undefined;
}

function partyIsEnabled() {
    return socket !== undefined;
}