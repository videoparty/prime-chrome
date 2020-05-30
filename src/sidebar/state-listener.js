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
        handleNotification(change.action, change.message);
    }
}

/**
 * When the sidebar gets moved or browses to another page,
 * the state gets lost.
 */
listenToWindowEvent('sidebar:state-init', (ev) => {
    if (ev.data.changes) {
        for (const change of ev.data.changes) {
            handleChange(change);
        }
    }

    initMemberList(ev.data.members);
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