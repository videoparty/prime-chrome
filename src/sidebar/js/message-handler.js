/**
 * Display notification and chat messages in the sidebar
 */

function handleNotification(action, message) {
    const icon = action ? '<i class="' + actionToFontAwesome(action) + '"></i>' : '';
    const errorClass = action === 'error' ? 'error' : '';
    $('#messages').prepend('' +
        '<div class="notification ' + errorClass + '">' +
        icon +
        '<em>' + message + '</em>' +
        '</div>')
}

function handleMemberNotification(action, memberName, message) {
    if (!memberName) return handleNotification(action, message);

    const icon = action ? '<i class="' + actionToFontAwesome(action) + '"></i>' : '';
    const errorClass = action === 'error' ? 'error' : '';


    $('#messages').prepend('' +
        '<div class="message">' +
        '<span class="sender">' + sanitize(memberName) + '</span>' +
        '<div class="chat-tip"></div>' +
        '<div class="chat notification ' + errorClass + '">' +
            icon +
            '<em>' + message + '</em>' +
        '</div>' +
        '</div>');
}

function handleChat(member,  message) {
    $('#messages').prepend('' +
        '<div class="message">' +
        '<span class="sender">' + sanitize(member) + '</span>' +
        '<div class="chat-tip"></div>' +
        '<div class="chat">' + sanitize(message) + '</div>' +
        '</div>')
}

function actionToFontAwesome(action) {
    switch (action) {
        case States.playing:
            return 'fas fa-play';
        case States.playerReady:
            return 'fas fa-check';
        case States.idle:
            return 'fas fa-desktop';
        case States.paused:
            return 'fas fa-pause';
        case States.watchingTrailer:
            return 'fas fa-film';
        case States.nextEpisode:
            return 'fas fa-forward';
        case 'join':
            return 'fas fa-sign-in-alt';
        case 'leave':
            return 'fas fa-sign-out-alt';
        case 'seek':
            return 'far fa-clock';
        case 'error':
            return 'fas fa-ban';
        case 'close':
            return 'far fa-window-close';
    }
}