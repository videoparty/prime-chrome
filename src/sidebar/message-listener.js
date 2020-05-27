/**
 * Display notification and chat messages in the sidebar
 */
listenToWindowEvent('notification', (ev) => {
    const icon = ev.data.action ? '<i class="fa fa-' + actionToFontAwesome(ev.data.action) + '"></i>' : '';
    const errorClass = ev.data.action === 'error' ? 'error' : '';
    $('#messages').prepend('' +
        '<div class="notification ' + errorClass + '">' +
        icon +
        '<em>' + ev.data.message + '</em>' +
        '</div>')
});

function actionToFontAwesome(action) {
    console.log(action);
    switch (action) {
        case States.playing:
            return 'play';
        case States.playerReady:
            return 'check';
        case States.idle:
            return 'desktop';
        case States.paused:
            return 'pause';
        case States.watchingTrailer:
            return 'film';
        case States.nextEpisode:
            return 'forward';
        case 'join':
            return 'sign-in';
        case 'leave':
            return 'sign-out';
        case 'seek':
            return 'clock-o';
        case 'error':
            return 'ban';
        case 'close':
            return 'window-close';
    }
}