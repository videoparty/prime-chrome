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
let copySuccess = undefined;
$('#copy-party-link').click(() => {
    sendMessageToRuntime({type: 'copy-party-url'});
    copySuccess = undefined;
    setTimeout(() => {
        // Alternative copy if the primary approach does not work
        if (!copySuccess) {
            console.error('Copy link error - No response from content script. Switching to manual copy.');
            alternativeCopyPartyUrl();
            confirmCodeCopy();
        }
    }, 200);
});

/**
 * The content script is responsible for constructing
 * the proper URL. Recenly a user complained about the
 * copy function not working, so here we have an alternative
 * way of copying the party url (only for primevideo.com).
 */
function alternativeCopyPartyUrl() {
    const partyCode = $('#party-code').val();
    const partyLink = 'https://primevideo.com/?pvpartyId=' + partyCode;
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(partyLink).select();
    document.execCommand("copy");
    $temp.remove();
}

/**
 * Show "Copied!" in copy button and reset after 3 sec.
 */
function confirmCodeCopy() {
    copySuccess = true;
    const copyLinkButton = $('#copy-party-link');
    copyLinkButton.html('<i class="fas fa-check" aria-hidden="true"></i> Copied!');
    setTimeout(() => {
        copyLinkButton.html('<i class="fas fa-paste" aria-hidden="true"></i> Copy link');
    }, 3000);
}
