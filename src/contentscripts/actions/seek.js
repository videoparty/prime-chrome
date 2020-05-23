let postponedSeekToTime;

/**
 * Listen to any event that triggers a jump to another time (can also be triggered by other party members)
 */
listenToWindowEvent('seek-video', async (ev) => {
    const time = ev.data.time += currentTimeOffset;

    if (isPlayingTrailer()) {
        // In case someone seeks when we are still watching
        // a trailer, postpone the seek until later.
        postponedSeekToTime = time;
    } else {
        performSeek(time);
    }
});

/**
 * Perform a jump to another time without
 * triggering the onseeked eventlistener
 */
function performSeek(time, emitPlayerReady = true) {
    if (time === undefined) return;
    player.onseeked = () => {
        if (emitPlayerReady) {
            postWindowMessage({type: 'player-ready'}); // Server will also emit a state update
        }
        player.onseeked = onSeeked;
    };
    performPause();
    player.currentTime = time;
}

/**
 * Listen to when the video seek finished
 */
function onSeeked() {
    if (isPlayingTrailer() || signalReadiness || !player) return;
    postWindowMessage({type: 'seek-video', time: player.currentTime - currentTimeOffset});
}