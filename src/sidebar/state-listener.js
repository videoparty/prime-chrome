/**
 * All local and remote actions that result
 * into a change of state, like playing, pausing, etc.
 */
listenToWindowEvent('start-video', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : myDisplayName;
    if (ev.reason === 'next-episode') {
        updateMemberStatus(member, States.nextEpisode);
    } else {
        updateMemberStatus(member, States.loading);
    }
});
listenToWindowEvent('state-update', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : myDisplayName;
    let state = States.unknown;
    for (let key in States) {
        if (ev.data.state === States[key]) {
            state = States[key];
            break;
        }
    }
    updateMemberStatus(member, state);
});
listenToWindowEvent('play-video', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : myDisplayName;
    updateMemberStatus(member, States.playing);
});
listenToWindowEvent('seek-video', () => {
    updateMemberStatus(myDisplayName, States.playerReady);
});
listenToWindowEvent('player-ready', () => {
    updateMemberStatus(myDisplayName, States.playerReady);
});
listenToWindowEvent('pause-video', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : myDisplayName;
    updateMemberStatus(member, States.paused);
});
listenToWindowEvent('close-video', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : myDisplayName;
    updateMemberStatus(member, States.idle);
});
listenToWindowEvent('watching-trailer', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : myDisplayName;
    updateMemberStatus(member, States.watchingTrailer);
});

/**
 * Update memberlist when someone joins or leaves
 */
listenToWindowEvent('member-change', (ev) => {
    if (ev.data.change === 'join') {
        addMemberToList(ev.data.member.displayName)
    } else if (ev.data.change === 'leave') {
        removeMemberFromList(ev.data.member.displayName)
    }
});
listenToWindowEvent('party-info', (ev) => {
    initMemberList(ev.data.currentParty);
});