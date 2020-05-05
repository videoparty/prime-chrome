/**
 * Add the 'pv' logo and member count tracker in the navbar
 */
jQuery(document).ready(() => {
    const memcount = currentParty ? currentParty.members.length : 0;
    jQuery('.pv-nav-container').append('' +
        '<div id="pv-party" style="margin-left: 15px;display: flex;cursor: help;justify-content: center;width: 110px;" title="Amount of members in party">' +
        '<div style="width: 100%;height: 100%;">' +
        '<img src="'+chrome.runtime.getURL('icon-small.png')+'" style="height: 36px;" alt="Party" />' +
        '</div>' +
        '<div class="party-user-count" style="margin: 7px 0 0 5px;width: 100%;height: 100%;">' +
        '<span id="party-member-count">' + memcount + '</span> 🙋‍♂️' +
        '</div>' +
        '</div>');
});

listenToWindowEvent('member-change', async () => {
    jQuery('#party-member-count').html(currentParty.members.length);
});