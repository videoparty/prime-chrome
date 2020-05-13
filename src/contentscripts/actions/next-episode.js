let nextEpisodeObserver;
let currentEpisode;

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
    nextEpisodeObserver?.disconnect();
    nextEpisodeObserver = new MutationObserver(handlePlayerParentChange);
    const observeConfig =  {
        attributes: false,
        childList: true,
        characterData: false
    };
    currentEpisode = getSeasonAndEpisode();
    nextEpisodeObserver.observe(jQuery(player).parent()[0], observeConfig);
}

function handlePlayerParentChange() {
    if (webPlayerIsOpen() && setPlayer() === undefined && currentEpisode) {
        nextEpisodeObserver.disconnect();
        // Perform a hacky trick by adding 'remote', so we do not emit it through socket.
        postWindowMessage({type: 'start-video', reason: 'next-episode', remote: true});
    }
}