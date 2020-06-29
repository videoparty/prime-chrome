$('#set-nickname').submit(function (ev) {
    ev.preventDefault(); // Prevent sidebar reload

    const textbox = $('input');
    const nickname = textbox.val();
    if (nickname.length === 0) return;// Don't process undefined nicknames

    // Post an event to parent
    postWindowMessage({type: 'set-displayname', displayName: nickname}, parent);

    // Redirect
    setTimeout(() => {
        window.location.href = chrome.runtime.getURL('src/sidebar/sidebar.html');
    }, 150);
});