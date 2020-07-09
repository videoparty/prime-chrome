/**
 * Listen to any action that triggers a pause (or triggered by other party members)
 */
listenToWindowEvent('pause-video', async (ev) => {
    const time = ev.data.time += currentTimeOffset;

    if (ev.data && time && (time > player.currentTime + 0.5 || time < player.currentTime - 0.5)) {
        performSeek(time, false);
    } else {
        performPause();
    }
});

/**
 * Pause when someone joined/left with a 'pause' flag enabled
 */
listenToWindowEvent('member-change', async (ev) => {
    if (!ev.data.pause || !player) return;
    performPause();
});

/**
 * Listen to when the video starts playing (again)
 * Do not broadcast when getting ready for coordinated
 * play.
 */
function onPause() {
    if (signalReadiness) return;
    postWindowMessage({
        type: 'pause-video',
        time: player.currentTime - currentTimeOffset
    });
}

/**
 * Triggers player.pause()
 * without triggering the eventhandler,
 * including error handling
 */
function performPause(broadcastStateUpdate = true) {
    if (player.paused) return;
    player.onpause = () => {player.onpause = onPause};
    try {
        player.pause();
        if (broadcastStateUpdate) {
            postWindowMessage({type: 'state-update', state: States.paused});
        }
    } catch(err) {
        console.error(err);
        player.onpause = onPause;
    }
}