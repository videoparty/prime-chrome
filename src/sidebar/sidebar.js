/**
 * Update memberlist when someone joins or leaves
 */
listenToWindowEvent('member-change', (ev) => {
    console.log('member change!');
    updateMemberList(ev.data.currentParty);
});
listenToWindowEvent('party-info', (ev) => {
    updateMemberList(ev.data.currentParty);
});

function updateMemberList(currentParty) {
    for (const member of currentParty.members) {
        if ($('#members div[data-id="' + member.id + '+]').length > 0) continue;
        $('#members').append('<div data-id="' + member.id + '">' + member.displayName + '</div>');
    }
}

// Load member list
postWindowMessage({type: 'sb-get-current-party'}, parent);