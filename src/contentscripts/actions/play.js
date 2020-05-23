/**
 * This file listens to the big 'play' button being clicked (or triggered by other party members)
 */

listenToWindowEvent('play-video', async (ev) => {
    if (!player) return;

    // Receive coordinated play action, unblock the play action
    if (waitingForCoordinatedPlay && ev.data.coordinated) {
        waitingForCoordinatedPlay = false;
    }

    if (player.paused === true && !waitingForCoordinatedPlay) {
        if(isPlayingTrailer()) { // Block all remote play actions during trailer
            postWindowMessage({
                type: 'pause-video',
                reason: 'watching-trailer'
            });
            return;
        }

        performPlay();
    }
});

/**
 * When everyone leaves and we are still locked, waiting for a coordinated play.
 */
listenToWindowEvent('member-change', async (ev) => {
    if (ev.data.change !== 'join' || !player) return;
    setTimeout(() => {
        if (currentParty.members.length === 1 && waitingForCoordinatedPlay) {
            waitingForCoordinatedPlay = false;
            performPlay();
        }
    }, 2010);
});

/**
 * Listen to when the video starts playing (again)
 */
function onPlay() {
    if (signalReadiness) {
        console.log('Signal readiness');
        performPause();
        postWindowMessage({type: 'player-ready'});
        signalReadiness = false;

        // Prevent broadcasting unnecessary seek event
        player.onseeked = undefined;
        setTimeout(() => player.onseeked = onSeeked, 600);
    } else if (waitingForCoordinatedPlay) {
        console.log('perform pause to wait for coordinated play action');
        performPause(false);
    } else {
        console.log('play video');
        postWindowMessage({type: 'play-video'});
    }
}

/**
 * Triggers player.play()
 * without triggering the eventhandler,
 * including error handling
 */
function performPlay(errorRetry = false) {
    console.log('performing play');
    if (!player.paused) return;
    player.onplay = () => {player.onplay = onPlay};
    try {
        player.play();
        postWindowMessage({type: 'state-update', state: States.playing});
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