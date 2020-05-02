/**
 * This file listens to the big 'pause' button being clicked (or triggered by other party members)
 */

listenToWindowEvent('pause-video', async (ev) => {
    await executeWithoutPauseListeners(async () => {
        try {
            await player.pause();
            if (ev.data && ev.data.time && (ev.data.time > player.currentTime + 0.5 || ev.data.time < player.currentTime - 0.5)) {
                player.onseeked = undefined; // Remove to prevent publishing unneccesary seek event
                player.currentTime = ev.data.time;
            }
        } catch (err) {
            console.error(err); /* Can't pause while performing the play() action */
        }
    }, true);
});
listenToWindowEvent('member-change', async (ev) => {
    if (!ev.data.pause || isPlayingTrailer()) return;
    await executeWithoutPauseListeners(async () => {
        try {
            await player.pause();
        } catch (err) {
            console.error(err); /* Can't pause while performing the play() action */
        }
    });
});

/**
 * Listen to when the video starts playing (again)
 */
function onPause() {
    if (signalReadiness) {
        signalReadiness = false;
    } else {
        window.postMessage({
            type: 'pause-video',
            time: player.currentTime
        }, '*');
    }
}

/**
 * Allows to execute code without triggering the
 * onpause and the next onseeked afterwards.
 *
 * Due to something strange, the onpause function
 * is triggered immediately after it's assigned in
 * the case when a remote party member pauses.
 * That's why we can skip the first pause event.
 */
async function executeWithoutPauseListeners(func, skipFirstPauseEvent = false) {
    if (!player) return;
    if (player.paused === false) {
        player.onpause = undefined; // Remove the eventlistener
        await func();
        if (player.onseeked === undefined) {
            player.onseeked = () => {
                player.onseeked = onSeeked
            }; // Reset the original eventhandler after the first trigger
        }
        if (skipFirstPauseEvent) {
            player.onpause = () => {
                player.onpause = onPause
            };
        } else {
            player.onpause = onPause;
        }
    }
}