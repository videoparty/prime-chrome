/**
 * This file listens to the big 'play' button being clicked (or triggered by other party members)
 */

let player;
// Readyness is signaled by all party members to perform a coordinated 'play'-action.
let signalReadyness = true;

(
    function () {
        listenToWindowEvent('start-video', () => {
            if (!partyIsEnabled()) return; // Don't do anything if the user didn't touch the extension
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