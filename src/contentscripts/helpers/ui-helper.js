/**
 * Finds the video element in the webplayer.
 * Returns undefined if the webplayer video element could not be found.
 */
function getPlayer() {
    // Do not set the player if we are watching a trailer.
    // If there are no play and pause buttons, skip
    if (isPlayingTrailer() || !hasWebplayerControls()) return undefined;

    // In case of a prior trailer, there are 2 video elements. Grab the last one.
    // The last video element will trigger onPlay when the trailer finished.
    const videoElements = jQuery('.webPlayerContainer video[src]');
    if (videoElements.length === 0 || jQuery(videoElements[videoElements.length - 1]).css('visibility') !== 'visible') {
        return undefined;
    } else if (videoElements[videoElements.length - 1].src.startsWith('blob')) {
        return videoElements[videoElements.length - 1];
    }

    return undefined;
}

/**
 * Detect whether the new webplayer is
 * showing the play/pause button.
 * (not compatible with legacy webplayer!)
 */
function hasWebplayerControls() {
    if (isLegacyWebPlayer()) return true;
    return jQuery('.webPlayerUIContainer .f1fo23vz .fveo0gq.f3s9by7.f1kiqelb.f1l8jkug.f13bmvti.fubttoo.fal744d.fbpe0th')
        .length > 0
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
    return getWebPlayerElement(
        '.bottomPanelItem .adSkipButton',
        '.fe39tpk .fu4rd6c.f1cw2swo')
        .length > 0;
}

/**
 * Calculates the difference betweeh
 * player.currentTime and the UI's time.
 * @see currentTimeOffset
 */
function getCurrentTimeOffset() {
    try {
        const timeIndicator = jQuery('.f1ha12bn.f177tia9.fc1n9o1.f25z3of.floz2gv.f1ak3391 .fheif50.f989gul.f1s55b4').clone();
        timeIndicator.find('*').remove();
        const splittedTime = timeIndicator.text().match(/(\d+):(\d+):(\d+)/);
        const hr = parseInt(splittedTime[1]) * 3600;
        const min = parseInt(splittedTime[2]) * 60;
        const sec = parseInt(splittedTime[3]);
        const offset = player.currentTime - (hr + min + sec);

        return offset < 2 ? 0 : offset;
    } catch(err) {
        return 0;
    }
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
 * @param action the State or 'join' or 'leave'
 * @param title optional
 */
function sendNotification(type, message, action = undefined, title = undefined) {
    //toastr[type](message, title);
    postWindowMessage({type: 'notification', message, title, action});
}