let closeObserver;
/**
 * When someone closed the video before we got there
 */
let closeImmediately = false;
/**
 * To track whether the webplayer was closed before on this page
 */
let webPlayerWasClosed = false;

/**
 * Listens when a remote member closed the video
 */
listenToWindowEvent('close-video', async () => {
    if (!closeObserver) {
        closeImmediately = true;
        return;
    }
    closeObserver?.disconnect();
    closeWebPlayer();
});

/**
 * Listens whether current video player was closed locally
 */
function startCloseListener() {
    closeObserver?.disconnect();

    if (closeImmediately) {
        closeWebPlayer();
        closeImmediately = false;
        return;
    }

    closeObserver = new MutationObserver(handleWebPlayerChange);
    const observeConfig = {attributes: true, characterData: false};
    closeObserver.observe(jQuery('#dv-web-player')[0], observeConfig);
}


function handleWebPlayerChange() {
    if (!webPlayerIsOpen()) {
        closeObserver.disconnect();
        postWindowMessage({type: 'close-video'});
    }
}

/**
 * Triggers a mouseclick on the 'close' button
 */
function closeWebPlayer() {
    lastClickedPlayItem = undefined;
    getWebPlayerElement(
        '.closeButtonWrapper img.svgBackground',
        '.fyysciv.f1yzibwv > .fo6n8wp.fud1t1u.f1njeegi img.fuorrko, .atvwebplayersdk-playerclose-button img.fuorrko').click();
    player.onplay = undefined;
    player.onpause = undefined;
    player.onseeked = undefined;
    player = undefined;
    stopNextEpisodeListener();
    webPlayerWasClosed = true;
    postWindowMessage({type: 'state-update', state: States.idle});
}
