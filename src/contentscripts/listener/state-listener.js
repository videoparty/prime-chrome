/**
 * All local and remote actions that result into a change of state,
 * like playing, pausing, chat, notifications, etc.
 * This is used to display in the sidebar. But since the sidebar can lose it's state,
 * the state will be managed by the main window using session storage.
 */

const leavingMembers = [];
let lastEpisodeNotification = {season: 0, episode: 0}; // To prevent duplicate notifications

listenToWindowEvent('start-video', (ev) => {
    const member = ev.data.remote && ev.data.byMember ? ev.data.byMember.displayName : displayName;
    if (ev.data.reason === 'next-episode'
        && (ev.data.season !== lastEpisodeNotification.season || ev.data.episode !== lastEpisodeNotification.episode)) {
        lastEpisodeNotification.season = ev.data.season;
        lastEpisodeNotification.episode = ev.data.episode;
        sendNotification('info', member + ' started the next episode', States.nextEpisode);
        updateMemberState(member, States.nextEpisode);
    } else if (!ev.data.reason || ev.data.reason !== 'next-episode') {
        sendNotification('info', member + ' started a video', States.playing, 'Loading..');
        updateMemberState(member, States.loading);
    }
});

listenToWindowEvent('next-episode', async (ev) => {
    const member = ev.data.remote ? ev.data.byMember.displayName : displayName;
    sendNotification('info', member + ' started the next episode', States.nextEpisode);
    updateMemberState(member, States.nextEpisode);
});

listenToWindowEvent('state-update', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : displayName;
    let state = States.unknown;
    for (let key in States) {
        if (ev.data.state === States[key]) {
            state = States[key];
            break;
        }
    }
    updateMemberState(member, state);
});

listenToWindowEvent('play-video', (ev) => {
    if (ev.data.coordinated) {
        sendNotification('info', 'Everyone is in sync', States.playerReady, 'Resumed');
    } else {
        const member = ev.data.byMember ? ev.data.byMember.displayName : displayName;
        sendNotification('info', member + ' resumed', States.playing);
        updateMemberState(member, States.playing);
    }
});

listenToWindowEvent('chat', (ev) => {
    if (!ev.data.remote) return; // Only accept from server
    sendChatMessage(ev.data.byMember.displayName, ev.data.message);
});

listenToWindowEvent('seek-video', (ev) => {
    const member = ev.data.remote ? ev.data.byMember.displayName : displayName;
    sendNotification('info', member + ' seeked to another time', 'seek');
    updateMemberState(member, States.playerReady);
});

listenToWindowEvent('player-ready', () => {
    updateMemberState(displayName, States.playerReady);
});

listenToWindowEvent('update-displayname', (ev) => {
    const change = {type: 'update-displayname', old: ev.data.old, new: ev.data.new, time: new Date()};
    processChange(change);
});

listenToWindowEvent('pause-video', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : displayName;
    if (ev.data.reason === 'watching-trailer' && ev.data.remote) {
        sendNotification('error', 'Cannot resume, ' + member + ' is watching a trailer', States.watchingTrailer);
        updateMemberState(member, States.watchingTrailer);
        return;
    } else if (ev.data.reason === 'watching-trailer' && !ev.data.remote) {
        updateMemberState(displayName, States.watchingTrailer);
        return;
    }
    sendNotification('info', member + ' paused', States.paused);
    updateMemberState(member, States.paused);
});

listenToWindowEvent('close-video', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : displayName;
    sendNotification('warning', member + ' closed the video', 'close');
    updateMemberState(member, States.idle);
});

listenToWindowEvent('watching-trailer', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : displayName;
    if (ev.data.remote) {
        sendNotification('warning', 'Waiting for ' + member + ' to finish a trailer..', States.watchingTrailer);
    } else {
        sendNotification('warning', 'The rest of the party waits for you to skip or finish the trailer', States.watchingTrailer);
    }
    updateMemberState(member, States.watchingTrailer);
});

listenToWindowEvent('notification', (ev) => {
    const member = ev.data.byMember ? ev.data.byMember.displayName : displayName;
    updateMemberState(member, States.watchingTrailer);
});

listenToWindowEvent('member-change', async (ev) => {
    let member = displayName;
    if (ev.data.remote && ev.data.member.displayName !== displayName) {
        member = ev.data.member.displayName;
    }

    updateMemberState(member, States.idle);

    if (ev.data.change === 'join') {
        // Do not show notification if the member joined back within 2 seconds
        if (removeLeavingMember(member)) return;

        // Prevent showing every time again 'You joined the party!' when browsing
        if ((ev.data.member.displayName === displayName && getStateChanges().length === 0)
            || (ev.data.member.displayName !== displayName)) {
            sendNotification('success', member + ' joined the party!', 'join');
        }
    } else if (ev.data.change === 'leave') {
        // Only show notification if the member does not rejoin within 2 secs
        leavingMembers.push(member);
        setTimeout(() => {
            if (leavingMembers.includes(member)) {
                removeLeavingMember(member);
                sendNotification('error', member + ' left the party', 'leave');
            }
        }, 2000);
    }
});

function removeLeavingMember(member) {
    if (leavingMembers.includes(member)) {
        const i = leavingMembers.indexOf(member);
        leavingMembers.splice(i, 1);
        return true;
    }
    return false;
}

/**
 * Sends a member status change to the sidebar
 * @param memberId
 * @param state
 */
function updateMemberState(memberId, state) {
    const change = {type: 'member-state', member: {id: memberId}, state, time: new Date()};
    return processChange(change);
}

/**
 * Sends a chat message to the sidebar
 * @param memberId
 * @param message
 */
function sendChatMessage(memberId, message) {
    const change = {type: 'chat', member: {id: memberId}, message, time: new Date()};
    return processChange(change);
}

/**
 * Sends a notification as a state change to the sidebar.
 * @param notificationType 'success', 'info', 'warning', 'error'
 * @param message
 * @param action the State or 'join' or 'leave'
 * @param title optional
 */
function sendNotification(notificationType, message, action = undefined, title = undefined) {
    const change = {type: 'notification', notificationType, message, action, title, time: new Date()};
    return processChange(change);
}

function processChange(change) {
    const stateChanges = getStateChanges();
    stateChanges.push(change);
    saveStateChanges(stateChanges);

    const sidebarIframe = getSidebarIframe();
    if (sidebarIframe) {
        postWindowMessage({type: 'sidebar:state-update', change}, sidebarIframe.contentWindow);
    }
}

/**
 * Parses the serialized state changes from
 * local storage or, if not present, will return
 * an empty array.
 */
function getStateChanges() {
    const partyId = currentParty ? currentParty.id : 'unknown';
    let stateChanges = sessionStorage.getItem(partyId + ':party-state-changes');
    if (!stateChanges) {
        stateChanges = [];
    } else {
        stateChanges = JSON.parse(stateChanges);
    }
    return stateChanges;
}

function saveStateChanges(stateChanges) {
    const partyId = currentParty ? currentParty.id : 'unknown';
    sessionStorage.setItem(partyId + ':party-state-changes', JSON.stringify(stateChanges));
}