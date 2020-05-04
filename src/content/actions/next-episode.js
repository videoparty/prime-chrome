let nextEpisodeObserver;

/**
 * Listen to any action that triggers a pause (or triggered by other party members)
 */
listenToWindowEvent('next-episode', async (ev) => {
    const currentInfo = getSeasonAndEpisode();
    if (ev.data.season !== currentInfo.season || ev.data.episode !== currentInfo.episode) {
        performNextEpisode();
    }
});

/**
 * Listen to when the current player element
 * gets deleted and replaced by another video object.
 * Then, the start-video will kick off again.
 */
function startNextEpisodeListener() {
    nextEpisodeObserver?.disconnect();
    nextEpisodeObserver = new MutationObserver(handlePlayerParentChange);
    const observeConfig =  {
        attributes: false,
        childList: true,
        characterData: false
    };
    nextEpisodeObserver.observe(jQuery(player).parent()[0], observeConfig);
}

function handlePlayerParentChange() {
    if (webPlayerIsOpen() && setPlayer() === undefined) {
        nextEpisodeObserver.disconnect();
        // Perform a hacky trick by adding 'remote', so we do not emit it through socket.
        window.postMessage({type: 'start-video', reason: 'next-episode', remote: true}, '*');
    }
}