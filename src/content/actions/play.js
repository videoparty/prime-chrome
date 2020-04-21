/**
 * This file listens to the big 'play' button being clicked (or triggered by other party members)
 */

(
    function () {
        listenToWindowEvent('play-video', async (ev) => {
            if (!player) return;
            if (player.paused === true) {
                player.onplay = undefined; // Remove the eventlistener to prevent recursive spam
                try {
                    await player.play();
                } catch(err) {/* Can't play while pausing */}
                player.onplay = onPlay;
            }
        });
    }
)();

/**
 * Listen to when the video starts playing (again)
 */
function onPlay() {
    if (signalReadyness) {
        // todo don't signal readyness when watching a trailer
        window.postMessage({type: 'player-ready'}, '*');
        setTimeout(() => {
            try {
                player.pause();
            } catch(err) {/* Can't play while pausing */}

            // todo Set current time in case of start-video
        }, 150);
        // signalReadyness will be set to false in pause.js
    } else {
        window.postMessage({type: 'play-video'}, '*')
    }
}