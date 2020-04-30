/**
 * Listen to when the current player element
 * gets deleted and replaced by another video object.
 * Then, the start-video will kick off again.
 */

let playerObserver;

function startNextEpisodeListener() {
    playerObserver?.disconnect();
    playerObserver = new MutationObserver(handlePlayerParentChange);
    const observeConfig =  {
        attributes: false,
        childList: true,
        characterData: false
    };
    playerObserver.observe(jQuery(player).parent()[0], observeConfig);
}


function handlePlayerParentChange() {
    console.log('Something changed!');
    if (setPlayer() === undefined) {
        playerObserver.disconnect();
        console.log('Oh noes, we are gone! Restart..');
        // Perform a hacky trick by adding 'remote', so we do not emit it through socket.
        window.postMessage({type: 'start-video', remote: true}, '*');
    }
}