/**
 * Finds the video element in the webplayer and sets the global player variable.
 * Sets to undefined if the webplayer video element could not be found.
 */
function setPlayer() {
    // In case of a prior trailer, there are 2 video elements. Grab the last one.
    // The last video element will trigger onPlay when the trailer finished.
    const videoElements = jQuery('.webPlayerContainer video[src]');
    if (videoElements.length === 0) {
        player = undefined;
    } else if (videoElements[videoElements.length - 1].src.startsWith('blob')) {
        player = videoElements[videoElements.length - 1];
    }

    return player;
}

/**
 * Check if the user is currently watching a trailer
 * @returns boolean
 */
function isPlayingTrailer() {
    const skipButton = jQuery('.bottomPanelItem .adSkipButton');
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
        const extracted = jQuery('.contentTitlePanel .subtitle').html().match(/(\d+)\D*(\d+)/);
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
    jQuery('.nextTitleButton .text').click();
}

/**
 * Show the overlay spinner
 */
function showSpinner() {
    jQuery('.overlay .loadingSpinner').css('display', 'block');
}

/**
 * Hide the overlay spinner
 */
function hideSpinner() {
    jQuery('.overlay .loadingSpinner').css('display', 'none');
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