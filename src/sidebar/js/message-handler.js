/**
 * Display notification and chat messages in the sidebar
 */

function handleNotification(action,  message) {
    const icon = action ? '<i class="fa fa-' + actionToFontAwesome(action) + '"></i>' : '';
    const errorClass = action === 'error' ? 'error' : '';
    $('#messages').prepend('' +
        '<div class="notification ' + errorClass + '">' +
        icon +
        '<em>' + message + '</em>' +
        '</div>')
}

function handleChat(member,  message) {
    $('#messages').prepend('' +
        '<div class="chat">' +
        '<span class="member">' + member + '</span>' +
        '<span class="message">' + message + '</span>' +
        '</div>')
}

function actionToFontAwesome(action) {
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