/**
 * This file listens when the big 'play' button was clicked (or triggered by other party members)
 */

let player;
// Readiness is signaled by all party members to perform a coordinated 'play'-action.
let signalReadiness = true;

listenToWindowEvent('start-video', (ev) => {
    if (!partyIsEnabled()) return; // Don't do anything if the user didn't open the extension
    player = undefined;
    const waitForPlayer = setInterval(() => { // Todo rebuild this to a MutationListener (with a setPlayer check before)
        // Set the 'player' variable with the video element or undefined.
        if (setPlayer() === undefined) return;

        clearInterval(waitForPlayer);
        signalReadiness = true;
        if (isPlayingTrailer()) {
            handleWatchingTrailer();
        } else {
            bindPlayerEvents();
            // Explicitly pause in case the video was restarted from the same page.
            if (webPlayerWasClosed && currentParty.members.length > 1) {
                performPause();
            }
        }

        // The next episode was started from the local webplayer. Broadcast it to the rest of the party
        if (ev.data.reason === 'next-episode') {
            window.postMessage({type: 'next-episode', ...getSeasonAndEpisode() }, '*');
        }
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
    startNextEpisodeListener();
    startCloseListener();
}

/**
 * We are watching a trailer. When the trailer is finished,
 * the original player will start automatically. When this
 * happens, check if someone seeked to another time previously.
 */
function handleWatchingTrailer() {
    player.onplay = () => {
        // After the trailer finishes, the player plays. Then bind the events.
        bindPlayerEvents();
        if (postponedSeekToTime !== undefined) {
            performSeek(postponedSeekToTime); // Inform party after we seek
            postponedSeekToTime = undefined;
        } else {
            player.onplay = onPlay; // Restore original eventhandler
            onPlay(); // Inform the party that we are playing now
        }
    };
    window.postMessage({type: 'watching-trailer'}, '*');
}