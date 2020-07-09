/**
 * This file listens when the big 'play' button was clicked (or triggered by other party members)
 */

/**
 * The webplayer object.
 * The actions are bound to this html element.
 */
let player;
/**
 * Sometimes the content starts with a 10-sec trailer.
 * That means that 00:00:01 in the webplayer UI
 * is actually 00:00:11 in the <video> element.
 */
let currentTimeOffset = 0;
/**
 * Readiness is signaled by all party members to perform a coordinated 'play'-action.
 */
let signalReadiness = true;
/**
 * Whether to block the local play actions unless it's coordinated
 */
let waitingForCoordinatedPlay = true;
/**
 * If we are watching a trailer, inform the server just once.
 */
let signaledWatchingTrailer = false;

listenToWindowEvent('start-video', (ev) => {
    if (!partyIsEnabled()) return; // Don't do anything if the user didn't open the extension
    player = undefined;
    postWindowMessage({type: 'state-update', state: States.loading});
    const waitForPlayer = setInterval(() => {
        if (isPlayingTrailer()) {
            if (!signaledWatchingTrailer) {
                startCloseListener(); // Do not bind actions, only listen to close.
                postWindowMessage({type: 'watching-trailer'});
                signaledWatchingTrailer = true;
            }
            player = undefined;
            // Keep the interval going until the trailer finished / skipped
            return;
        }

        // Set the 'player' variable with the video element or undefined.
        player = getPlayer();
        if (player === undefined) return;

        clearInterval(waitForPlayer);
        signaledWatchingTrailer = false;
        signalReadiness = true;
        waitingForCoordinatedPlay = true;
        bindPlayerEvents();

        // The next episode was started from the local webplayer. Broadcast it to the rest of the party
        if (ev.data.reason === 'next-episode') {
            postWindowMessage({type: 'next-episode', ...getSeasonAndEpisode() });
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

    setTimeout(() => {
        currentTimeOffset = getCurrentTimeOffset();
    }, 2500);

    // If the content is already playing,
    // manually call onPlay() to trigger the getting-ready process.
    if (!player.paused) {
        console.log('onplay because player already started');
        onPlay();
    }
}