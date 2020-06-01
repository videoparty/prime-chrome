let lastTimeout = undefined;
$('#send-chat').submit(function (ev) {
    ev.preventDefault(); // Prevent sidebar reload
    if ($(this).attr('disabled')) return showSpamWarning(); // Don't proceed if form is disabled

    const textbox = $('#send-chat input');
    const message = textbox.val();
    if (message.length === 0) return;// Don't process empty messages

    // Post a chat event to parent, so the parent sends it through
    // websocket and sends back a state change to this sidebar
    postWindowMessage({type: 'chat', message}, parent);

    textbox.val(''); // Empty textbox

    // Prevent spam
    $(this).attr('disabled', true);
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = setTimeout(() => {
        $(this).removeAttr('disabled');
        $('.chat-spam-warning').css('display', 'none');
    }, 500);
});

function showSpamWarning() {
    $('.chat-spam-warning').css('display', 'block');
}