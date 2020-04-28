/**
 * Add the 'pv' logo and member count tracker in the navbar
 */

jQuery('.pv-nav-container').append('' +
    '<div id="pv-party" style="margin-left: 15px;display: flex;cursor: help;justify-content: center;width: 100px;" title="Amount of members in party">' +
    '<div style="width: 100%;height: 100%;">' +
        '<img src="https://primevideoparty.com/pv-logo.png" style="height: 36px;" alt="Party" />' +
    '</div>' +
    '<div class="party-user-count" style="margin: 7px 0 0 5px;width: 100%;height: 100%;">' +
        '<span id="party-member-count">0</span>' +
        '<img src="https://primevideoparty.com/users.png" style="margin-top: 5px;" alt="users" />' +
    '</div>' +
    '</div>');

listenToWindowEvent('member-change', (ev) => {
    jQuery('#party-member-count').html(ev.data.currentMembers.length);
});