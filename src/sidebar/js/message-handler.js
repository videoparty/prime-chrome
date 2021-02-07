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

function handleStoreReviewChat() {
    $('#messages').prepend('' +
        '<div class="message" id="review-question">' +
        '<span class="sender dev">Marnix</span>' +
        '<div class="chat-tip"></div>' +
        '<div class="chat notification">' +
            'Hi there! I\'m the creator of PrimeVideoParty. It is amazing to see so many people using this plugin! ' +
            'Unfortunately, most of the bad experiences end up in the plugin reviews and that makes me sad :-( <br/>' +
            'Can you help me by leaving a review on the web store, so more people can enjoy PvP? Thanks a ton!' +
            '<a href="https://chrome.google.com/webstore/detail/prime-video-party/eingklpogjmofcedolfbgoomghkaamkn/reviews" target="_blank" class="review-button store">Review PvP</a>' +
            '<a href="#" class="review-button remind">Maybe later</span>' +
            '<a href="#" class="review-button no">Don\'t remind me again</span>' +
        '</div>' +
        '</div>');

    $('#review-question .review-button.store').click(() => {
        $('#review-question .chat.notification').html('Thank you for your review, I greatly appreciate it!');
        postWindowMessage({type: 'store-review-change', status: 'done'}, parent);
    });

    $('#review-question .review-button.remind').click(() => {
        $('#review-question .chat.notification').html('Thank you, I\'ll ask you another time. Enjoy your party!');
        postWindowMessage({type: 'store-review-change', status: 'later'}, parent);
    });

    $('#review-question .review-button.no').click(() => {
        $('#review-question .chat.notification').html('No worries, enjoy your party!');
        postWindowMessage({type: 'store-review-change', status: 'no'}, parent);
    });
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
