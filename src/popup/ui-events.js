// Create new party button
$('#new-party-link').click(() => {
    createAndJoinNewParty();
});

// Copy party code button (hidden for now)
$('#copy-party-code').click(() => {
    copyValToClipboard('#party-code');
    const copiedHint = $('.code-copied-hint');
    copiedHint.css('display', 'inline');
    setTimeout(() => {
        copiedHint.css('display', 'none');
    }, 3000);
});

// Copy party link button
$('#copy-party-link').click(() => {
    copyValToClipboard('#party-link');
    const copyLinkButton = $('#copy-party-link');
    copyLinkButton.html('<i class="fa fa-check" aria-hidden="true"></i> Copied!');
    setTimeout(() => {
        copyLinkButton.html('<i class="fa fa-clipboard" aria-hidden="true"></i> Copy link');
    }, 3000);
});

// Listen to incoming events
window.addEventListener('message', function (ev) {
    const msg = ev.data;
    switch (msg.type) {
        case 'party-info':
            $('#party-link').val(msg.link);
            $('#party-code').val(msg.partyId);
            break;
    }
}, false);

// Get current party on init.
// When there is no party,
// a new one will be created.
getCurrentParty();