/**
 * This file listens to all remote actions and displays notifications accordingly
 */

const leavingMembers = [];

listenToWindowEvent('start-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    if (ev.data.reason === 'next-episode') {
        sendNotification('info', memberName + ' started the next episode');
    } else {
        sendNotification('info', memberName + ' started a video', 'Loading..');
    }
});

listenToWindowEvent('next-episode', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    sendNotification('info', memberName + ' started the next episode');
});

listenToWindowEvent('pause-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    if (ev.data.reason === 'watching-trailer' && ev.data.remote) {
        sendNotification('error', 'Cannot resume, ' + memberName + ' is watching a trailer');
        return;
    } else if(ev.data.reason === 'watching-trailer' && !ev.data.remote) {
        return;
    }

    sendNotification('info', memberName + ' paused');
});

listenToWindowEvent('watching-trailer', async (ev) => {
    if (ev.data.remote) {
        sendNotification('warning', 'Waiting for ' + ev.data.byMember.displayName + ' to finish a trailer..');
    } else {
        sendNotification('warning', 'The rest of the party waits for you to skip or finish the trailer');
    }
});

listenToWindowEvent('play-video', async (ev) => {
    if (ev.data.coordinated) {
        sendNotification('info', 'Everyone is in sync', 'Resumed');
    } else {
        const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
        sendNotification('info', memberName + ' resumed');
    }
});

listenToWindowEvent('seek-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    sendNotification('info', memberName + ' seeked to another time');
});

listenToWindowEvent('close-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    sendNotification('warning', memberName + ' closed the video');
});

listenToWindowEvent('member-change', async (ev) => {
    let memberName = 'You';
    if (ev.data.remote && ev.data.member.displayName !== displayName) {
        memberName = ev.data.member.displayName;
    }

    if (ev.data.change === 'join') {
        // Do not show notification if the member joined back within 2 seconds
        if (removeLeavingMember(memberName)) return;

        if (ev.data.pause && player) {
            sendNotification('success', memberName + ' joined the party! Waiting for ' + memberName + ' to sync up..');
        } else {
            sendNotification('success', memberName + ' joined the party!');
        }
    } else if (ev.data.change === 'leave') {
        // Only show notification if the member does not rejoin within 2 secs
        leavingMembers.push(memberName);
        setTimeout(() => {
            if (leavingMembers.includes(memberName)) {
                removeLeavingMember(memberName);
                sendNotification('error', memberName + ' left the party');
            }
        }, 2000);
    }
});

function removeLeavingMember(memberName) {
    if (leavingMembers.includes(memberName)) {
        const i = leavingMembers.indexOf(memberName);
        leavingMembers.splice(i, 1);
        return true;
    }
    return false;
}