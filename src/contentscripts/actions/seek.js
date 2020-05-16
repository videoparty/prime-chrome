let postponedSeekToTime;

/**
 * Listen to any event that triggers a jump to another time (can also be triggered by other party members)
 */
listenToWindowEvent('seek-video', async (ev) => {
    if (ev.data.isLegacyPlayer && !isLegacyWebPlayer() && ev.data.remote) ev.data.time -= 10;
    else if (!ev.data.isLegacyPlayer && isLegacyWebPlayer() && ev.data.remote) ev.data.time += 10;

    if (isPlayingTrailer()) {
        // In case someone seeks when we are still watching
        // a trailer, postpone the seek until later.
        postponedSeekToTime = ev.data.time;
    } else {
        performSeek(ev.data.time);
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
            postWindowMessage({type: 'player-ready'});
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
    postWindowMessage({type: 'seek-video', time: player.currentTime});
}