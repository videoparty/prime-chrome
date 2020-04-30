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
            console.log(err); /* Can't pause while performing the play() action */
        }
    });
});
listenToWindowEvent('member-change', async (ev) => {
    if (!ev.data.pause) return;
    await executeWithoutPauseListeners(async () => {
        try {
            await player.pause();
        } catch (err) {
            console.log(err); /* Can't pause while performing the play() action */
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
 * onpause and the next onseeked afterwards
 * @param func
 */
async function executeWithoutPauseListeners(func) {
    if (!player) return;
    if (player.paused === false) {
        player.onpause = undefined; // Remove the eventlistener
        await func();
        player.onseeked = () => {
            player.onseeked = onSeeked
        }; // Reset the original eventhandler after the first trigger
        player.onpause = onPause;
    }
}