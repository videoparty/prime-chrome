let legacyNextEpisodeObserver, nextEpisodeObserver, currentEpisode;

/**
 * Listen to any action that triggers a pause (or triggered by other party members)
 */
listenToWindowEvent('next-episode', async (ev) => {
    currentEpisode = getSeasonAndEpisode();
    if (currentEpisode && (ev.data.season !== currentEpisode.season || ev.data.episode !== currentEpisode.episode)) {
        performNextEpisode();
    }
});

/**
 * Listen to when the current player element
 * gets deleted and replaced by another video object.
 * Then, the start-video will kick off again.
 */
function startNextEpisodeListener() {
    if (!player) return false;

    currentEpisode = getSeasonAndEpisode();

    // The legacy web player completely replaces the video element with a different one.
    legacyNextEpisodeObserver?.disconnect();
    legacyNextEpisodeObserver = new MutationObserver(handlePlayerParentChange);
    const legacyObserveConfig = {childList: true, characterData: false};
    legacyNextEpisodeObserver.observe(jQuery(player).parent()[0], legacyObserveConfig);

    // The new web player simply changes the video `src` attribute
    nextEpisodeObserver?.disconnect();
    nextEpisodeObserver = new MutationObserver(handlePlayerParentChange);
    const observeConfig = {attributes: true, characterData: false};
    nextEpisodeObserver.observe(jQuery(player)[0], observeConfig);
}

function stopNextEpisodeListener() {
    legacyNextEpisodeObserver?.disconnect();
    nextEpisodeObserver?.disconnect();
}

function handlePlayerParentChange() {
    // Use a timeout to give the closeObserver some time to check if the webplayer has closed.
    setTimeout(() => {
        if (webPlayerIsOpen() && player && currentEpisode) {
            console.log('Next episode detected!');
            player = getPlayer();
            if (player === undefined) {
                stopNextEpisodeListener();
            }
            // Perform a hacky trick by adding 'remote', so we do not emit it through socket.
            postWindowMessage({type: 'start-video', reason: 'next-episode', remote: true});
        }
    }, 200);
}