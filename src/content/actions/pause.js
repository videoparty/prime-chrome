/**
 * This file listens to the big 'pause' button being clicked (or triggered by other party members)
 */

(
    function () {
        listenToWindowEvent('pause-video', async (ev) => {
            if (!player) return;
            if (player.paused === false) {
                player.onpause = undefined; // Remove the eventlistener to prevent recursive spam
                try {
                    await player.pause();
                    if (ev.data && ev.data.time && (ev.data.time > player.currentTime + 0.5 || ev.data.time < player.currentTime - 0.5)) {
                        player.onseeked = undefined; // Remove to prevent publishing unneccesary seek event
                        player.currentTime = ev.data.time;
                    }
                } catch (err) {
                    console.log(err); /* Can't pause while performing the play() action */
                }
                player.onseeked = () => {
                    player.onseeked = onSeeked
                }; // Reset the original eventhandler after buffering
                player.onpause = onPause;
            }
        });
    }
)();

/**
 * Listen to when the video starts playing (again)
 */
function onPause() {
    if (signalReadyness) {
        signalReadyness = false;
    } else {
        window.postMessage({
            type: 'pause-video',
            time: player.currentTime
        }, '*');
    }
}