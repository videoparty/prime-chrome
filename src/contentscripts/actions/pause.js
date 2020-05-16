/**
 * Listen to any action that triggers a pause (or triggered by other party members)
 */
listenToWindowEvent('pause-video', async (ev) => {
    if (ev.data.isLegacyPlayer && !isLegacyWebPlayer() && ev.data.remote) ev.data.time -= 10;
    else if (!ev.data.isLegacyPlayer && isLegacyWebPlayer() && ev.data.remote) ev.data.time += 10;

    if (ev.data && ev.data.time && (ev.data.time > player.currentTime + 0.5 || ev.data.time < player.currentTime - 0.5)) {
        performSeek(ev.data.time, false);
    } else {
        performPause();
    }
});

/**
 * Pause when someone joined/left with a 'pause' flag enabled
 */
listenToWindowEvent('member-change', async (ev) => {
    if (!ev.data.pause || !player || !player.paused) return;
    performPause();
});

/**
 * Listen to when the video starts playing (again)
 */
function onPause() {
    if (signalReadiness) return;
    postWindowMessage({
        type: 'pause-video',
        time: player.currentTime
    });
}

/**
 * Triggers player.pause()
 * without triggering the eventhandler,
 * including error handling
 */
function performPause() {
    if (player.paused) return;
    player.onpause = () => {player.onpause = onPause};
    try {
        player.pause();
    } catch(err) {
        console.error(err);
        player.onpause = onPause;
    }
}