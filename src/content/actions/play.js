/**
 * This file listens to the big 'play' button being clicked (or triggered by other party members)
 */

listenToWindowEvent('play-video', async () => {
    if (!player) return;
    if (player.paused === true) {
        player.onplay = undefined; // Remove the eventlistener to prevent recursive spam
        try {
            await player.play();
        } catch(err) {/* Can't play while pausing */}
        player.onplay = onPlay;
    }
});

/**
 * Listen to when the video starts playing (again)
 */
function onPlay() {
    if (!signalReadiness) {
        window.postMessage({type: 'play-video'}, '*')
        // signalReadiness will have a follow up in seek.js and set to false in pause.js
    }
}