/**
 * Finds the video element in the webplayer and sets the global player variable.
 * Sets to undefined if the webplayer video element could not be found.
 */
function setPlayer() {
    // Do not set the player if we are watching a trailer!
    if (isPlayingTrailer()) return undefined;

    // In case of a prior trailer, there are 2 video elements. Grab the last one.
    // The last video element will trigger onPlay when the trailer finished.
    const videoElements = jQuery('.webPlayerContainer video[src]');
    if (videoElements.length === 0 || jQuery(videoElements[videoElements.length - 1]).css('visibility') !== 'visible') {
        player = undefined;
    } else if (videoElements[videoElements.length - 1].src.startsWith('blob')) {
        player = videoElements[videoElements.length - 1];
    }

    return player;
}

/**
 * 14-05-2020, a new webplayer is rolled
 * out across regions gradually.
 * This new webplayer uses obfuscated class names.
 */
function isLegacyWebPlayer() {
    return jQuery('.webPlayerElement .webPlayer').length > 0;
}

/**
 * Helper to get the correct element according to
 * whic webplayer is applied.
 * @see isLegacyWebPlayer
 */
function getWebPlayerElement(legacySelector, newSelector) {
    return isLegacyWebPlayer() ? jQuery(legacySelector) : jQuery(newSelector);
}

/**
 * Check if the user is currently watching a trailer
 * @returns boolean
 */
function isPlayingTrailer() {
    const skipButton = getWebPlayerElement(
        '.bottomPanelItem .adSkipButton',
        '.fe39tpk .fu4rd6c.f1cw2swo');
    return skipButton.length > 0;
}

/**
 * If the webplayer is currently open or not
 */
function webPlayerIsOpen() {
    const webplayer = jQuery('#dv-web-player');
    return webplayer && webplayer.hasClass('dv-player-fullscreen');
}

/**
 * Gets the current season and episode
 * number from the webplayer
 */
function getSeasonAndEpisode() {
    try {
        const extracted = getWebPlayerElement(
            '.contentTitlePanel .subtitle',
            '.f15586js.f1iodedr.fdm7v.fs89ngr').html().match(/(\d+)\D*(\d+)/);
        return {
            season: extracted[1],
            episode: extracted[2]
        }
    } catch(err) {}
    return undefined;
}

/**
 * Perform a mouseclick event on the
 * 'next episode' link in the webplayer
 */
function performNextEpisode() {
    getWebPlayerElement('.nextTitleButton .text', '.f1l8jkug.fpp3az0').click();
}

/**
 * Sends a toastr notification in the top center of the window.
 * Html code is escaped.
 * @param type 'success', 'info', 'warning', 'error'
 * @param message
 * @param title optional
 */
function sendNotification(type, message, title = undefined) {
    toastr[type](message, title);
}