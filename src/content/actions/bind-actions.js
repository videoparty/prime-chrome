/**
 * This file listens to the big 'play' button being clicked (or triggered by other party members)
 */

let player;
// Readyness is signaled by all party members to perform a coordinated 'play'-action.
let signalReadyness = true;

(
    function () {
        // The listener must start after a video started, otherwise the
        // webplayer doesn't exist yet.
        listenToWindowEvent('start-video', (data) => {
            player = undefined;
            const waitForPlayer = setInterval(() => {
                player = jQuery('.webPlayerContainer video[src]')[0];
                if (player) {
                    player.onplay = onPlay;
                    player.onpause = onPause;
                    player.onseeked = onSeeked;
                    signalReadyness = true;
                    startCloseListener();
                    clearInterval(waitForPlayer);
                }
            }, 100);
        });
    }
)();