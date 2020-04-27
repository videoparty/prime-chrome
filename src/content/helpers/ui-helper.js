/**
 * Finds the video element in the webplayer and sets the global player variable.
 * Sets to undefined if the webplayer video element could not be found.
 */
function setPlayer() {
    // In case of a prior trailer, there are 2 video elements. Grab the last one.
    // The last video element will trigger onPlay when the trailer finished.
    const videoElements = jQuery('.webPlayerContainer video[src]');
    player = videoElements.length > 0 ? videoElements[videoElements.length - 1] : undefined;
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
 * Shows an error modal using the webplayer overlay
 * UNTESTED
 */
function showErrorModal(title, message) {
    jQuery('.webPlayer .overlaysContainer').append('' +
        '<div class="modalContainer flexRow" style="display: flex;">' +
        '<div class="modal flexColumn"><div class="errorModal flexColumn">' +
        '<div class="title">' + title + '<div class="closePlayer html5"></div></div>' +
        '<div class="description scrollableVertical">' + message + '</div>' +
        '<div class="footer"><div class="button">Close player</div></div>' +
        '</div></div></div>');
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