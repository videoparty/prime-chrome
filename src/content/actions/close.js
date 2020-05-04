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
    const observeConfig =  {
        attributes: true,
        childList: false,
        characterData: false
    };
    closeObserver.observe(jQuery('#dv-web-player')[0], observeConfig);
}


function handleWebPlayerChange() {
    if (!webPlayerIsOpen()) {
        closeObserver.disconnect();
        window.postMessage({type: 'close-video'}, '*');
    }
}

/**
 * Triggers a mouseclick on the 'close' button
 */
function closeWebPlayer() {
    lastClickedPlayItem = undefined;
    jQuery('.closeButtonWrapper img.svgBackground').click();
    player = undefined;
    nextEpisodeObserver?.disconnect();
    webPlayerWasClosed = true;
}