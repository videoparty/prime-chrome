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
    const time = player.currentTime - currentTimeOffset;

    postWindowMessage({
        type: 'pause-video',
        time
    });

    // Ask for a webstore review if someone pauses after 10 minutes of watching
    if (time > 600 && askForStoreReview !== undefined && askForStoreReview.readyToAsk) {
        askForStoreReview.readyToAsk = false; // Prevent spam
        setTimeout(() => {
            if (player.paused) {
                processChange({type: 'store-review-msg'}); // Trigger sidebar with message
            } else {
                askForStoreReview.readyToAsk = true; // Wasn't able to send the message
            }
        }, 2000);
    }
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
