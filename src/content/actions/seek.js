/**
 * This file listens to the current time being reseeked to another point (can also be triggered by other party members)
 */

listenToWindowEvent('seek-video', async (ev) => {
    if (!player) return;
    player.onseeked = undefined;
    player.onpause = undefined; // Remove the eventlistener to prevent recursive spam
    try {
        console.log('pause from seek');
        player.pause();
        player.currentTime = ev.data.time;
    } catch (err) {/* Can't play while pausing */}
    player.onseeked = () => {
        window.postMessage({type: 'player-ready'}, '*');
        player.onseeked = onSeeked
    };
    player.onpause = onPause;
});

/**
 * Listen to when the video seek finished
 */
function onSeeked() {
    if (isPlayingTrailer()) return;
    player.onpause = undefined;
    player.pause();
    player.onpause = onPause;
    window.postMessage({type: 'seek-video', time: player.currentTime}, '*');
}