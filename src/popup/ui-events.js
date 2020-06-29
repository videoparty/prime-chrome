// Show current extension version number
$('.ext-version').html('version ' + chrome.runtime.getManifest().version)

// Create new party button
$('#new-party-link').click(() => {
    createAndJoinNewParty();
});

// Save displayname
$('#displayname').submit((ev) => {
    setDisplayName($('#displayname-text').val());
    $('.saved-hint').css('visibility', 'visible')
        .css('opacity', '1');

    setTimeout(() => {
        $('.saved-hint').css('visibility', 'hidden')
            .css('opacity', '0');
    }, 3000);
    ev.preventDefault(); // Prevent page reload
});

// Copy party link button
$('#copy-party-link').click(() => {
    sendMessageToRuntime({type: 'copy-party-url'});
    const copyLinkButton = $('#copy-party-link');
    copyLinkButton.html('<i class="fas fa-check" aria-hidden="true"></i> Copied!');
    setTimeout(() => {
        copyLinkButton.html('<i class="fas fa-paste" aria-hidden="true"></i> Copy link');
    }, 3000);
});

// Listen to incoming events
window.addEventListener('message', function (ev) {
    const msg = ev.data;
    switch (msg.type) {
        case 'party-info':
            $('#party-code').val(msg.partyId);
            break;
        case 'displayname':
            $('#displayname-text').val(msg.displayName);
            break;
    }
}, false);
