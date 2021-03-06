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
 * showing the play/pause button
 */
function hasWebplayerControls() {
    if (isLegacyWebPlayer()) return true;
    return getWebPlayerElement('.webPlayer .overlaysContainer .pausedOverlay .playIcon', 'button.atvwebplayersdk-playpause-button')
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
        '.fu4rd6c.f1cw2swo')
        .length > 0;
}

/**
 * Calculates the difference betweeh
 * player.currentTime and the UI's time.
 * @see currentTimeOffset
 */
function getCurrentTimeOffset() {
    try {
        const timeIndicator = getWebPlayerElement('.bottomPanelItem .infoBar .left .time', '.atvwebplayersdk-timeindicator-text').clone();
        timeIndicator.find('*').remove();
        const splittedTime = timeIndicator.text().match(/(?:(\d+):)?(\d+):(\d+)/);
        const hr = splittedTime[1] ? parseInt(splittedTime[1]) * 3600 : 0; // Sometimes there is no hour
        const min = parseInt(splittedTime[2]) * 60;
        const sec = parseInt(splittedTime[3]);
        const offset = player.currentTime - (hr + min + sec);
        console.log('Offset is ' + offset);
        return offset < 2 ? 0 : offset;
    } catch(err) {
        console.error('Tried to determine webplayer time offset: ' + err);
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
            '.f15586js.f1iodedr.fdm7v').html().match(/(\d+)\D*(\d+)/);
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
    getWebPlayerElement('.nextTitleButton .text', 'button.atvwebplayersdk-nexttitle-button').click();
}

/**
 * Copy the party URL to the clipboard
 */
function copyPartyUrl() {
    const partyLink = getCurrentBaseUrl() +'/?pvpartyId=' + currentParty.id;
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(partyLink).select();
    document.execCommand("copy");
    $temp.remove();
}

function getCurrentBaseUrl() {
    let url = window.location.origin;
    if (url.includes('amazon.')) {
        url += '/gp/video/storefront'
    }
    return url;
}
