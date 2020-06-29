/**
 * Receive state updates from the contentscript state listener
 */
listenToWindowEvent('sidebar:state-update', (ev) => handleChange(ev.data.change));

/**
 * A change can enter the sidebar through a realtime
 * state change, or a batch of changes during init.
 * @see processChange
 */
function handleChange(change) {
    if (change.type === 'member-state') {
        let state = States.unknown;
        for (let key in States) {
            if (change.state === States[key]) {
                state = States[key];
                break;
            }
        }
        updateMemberStatus(change.member.id, state);
    } else if (change.type === 'notification') {
        handleMemberNotification(change.action, change.memberName, change.message);
    } else if (change.type === 'chat') {
        handleChat(change.member.id, change.message);
    } else if (change.type === 'update-displayname') {
        handleMemberNotification(States.playerReady, change.old, 'Changed their nickname to ' + change.new);
        updateMemberName(change.old, change.new);
    }
}

/**
 * When the sidebar gets moved or browses to another page,
 * the state gets lost.
 */
listenToWindowEvent('sidebar:state-init', (ev) => {
    initMemberList(ev.data.members);

    if (ev.data.playerMode) {
        console.log('player mode');
        const sidebar = jQuery('html');
        sidebar.addClass('player-mode');
    }

    if (ev.data.changes) {
        for (const change of ev.data.changes) {
            handleChange(change);
        }
    }
});

/**
 * Update memberlist when someone joins or leaves
 */
listenToWindowEvent('member-change', (ev) => {
    if (ev.data.change === 'join') {
        addMemberToList(ev.data.member.displayName);
    } else if (ev.data.change === 'leave') {
        removeMemberFromList(ev.data.member.displayName);
    }
});