/**
 * This file listens when the big 'play' button was clicked (or triggered by other party members)
 */

let player;
// Readiness is signaled by all party members to perform a coordinated 'play'-action.
let signalReadiness = true;

listenToWindowEvent('start-video', () => {
    if (!partyIsEnabled()) return; // Don't do anything if the user didn't open the extension
    player = undefined;
    const waitForPlayer = setInterval(() => {
        // Set the 'player' variable with the video element or undefined.
        if (setPlayer() === undefined) return;

        clearInterval(waitForPlayer);
        if (isPlayingTrailer()) {
            window.postMessage({type: 'watching-trailer'}, '*');
        }
        signalReadiness = true;
        bindPlayerEvents();
    }, 200);
});

/**
 * Bind the onplay, onPause and onSeeked
 * events to the player using the
 * eventhandlers in these files:
 * - play.js
 * - pause.js
 * - seek.js
 * - close.js
 */
function bindPlayerEvents() {
    player.onplay = onPlay;
    player.onpause = onPause;
    player.onseeked = onSeeked;
    startCloseListener();
}