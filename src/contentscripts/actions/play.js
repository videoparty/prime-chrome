/**
 * This file listens to the big 'play' button being clicked (or triggered by other party members)
 */

listenToWindowEvent('play-video', async () => {
    if (!player) return;
    if (player.paused === true) {
        if(isPlayingTrailer()) { // Block all remote play actions during trailer
            postWindowMessage({
                type: 'pause-video',
                time: player.currentTime,
                reason: 'watching-trailer'
            });
            return;
        }

        performPlay();
    }
});

/**
 * Listen to when the video starts playing (again)
 */
function onPlay() {
    if (signalReadiness) {
        performPause();
        postWindowMessage({type: 'player-ready'});
        signalReadiness = false;

        // Prevent broadcasting unnecessary seek event
        player.onseeked = undefined;
        setTimeout(() => player.onseeked = onSeeked, 600);
    } else {
        postWindowMessage({type: 'play-video'});
    }
}

/**
 * Triggers player.play()
 * without triggering the eventhandler,
 * including error handling
 */
function performPlay(errorRetry = false) {
    if (!player.paused) return;
    player.onplay = () => {player.onplay = onPlay};
    try {
        player.play();
    } catch(err) {
        console.error(err);
        if (err.message.includes('https://goo.gl/LdLk22') && !errorRetry) {
            setTimeout(() => { performPlay(true) }, 50); // Race condition, try again
        } else {
            onPause(); // Trigger the onPause to broadcast a message and pause all other members.
            sendNotification('error', 'Could not play automatically. Please press the play button manually!', 'Error');
        }
        player.onplay = onPlay;
    }
}