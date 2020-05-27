/**
 * This file listens to all remote actions and displays notifications accordingly
 */

const leavingMembers = [];
let lastEpisodeNotification = {season: 0, episode: 0}; // To prevent duplicate notifications

listenToWindowEvent('start-video', async (ev) => {
    const memberName = ev.data.remote && ev.data.byMember ? ev.data.byMember.displayName : 'You';
    if (ev.data.reason === 'next-episode'
        && (ev.data.season !== lastEpisodeNotification.season || ev.data.episode !== lastEpisodeNotification.episode)) {
        lastEpisodeNotification.season = ev.data.season;
        lastEpisodeNotification.episode = ev.data.episode;
        sendNotification('info', memberName + ' started the next episode', States.playing);
    } else if (!ev.data.reason || ev.data.reason !== 'next-episode') {
        sendNotification('info', memberName + ' started a video', States.playing, 'Loading..');
    }
});

listenToWindowEvent('next-episode', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';

    sendNotification('info', memberName + ' started the next episode', States.playing);
});

listenToWindowEvent('pause-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    if (ev.data.reason === 'watching-trailer' && ev.data.remote) {
        sendNotification('error', 'Cannot resume, ' + memberName + ' is watching a trailer', States.watchingTrailer);
        return;
    } else if (ev.data.reason === 'watching-trailer' && !ev.data.remote) {
        return;
    }

    sendNotification('info', memberName + ' paused', States.paused);
});

listenToWindowEvent('watching-trailer', async (ev) => {
    if (ev.data.remote) {
        sendNotification('warning', 'Waiting for ' + ev.data.byMember.displayName + ' to finish a trailer..', States.watchingTrailer);
    } else {
        sendNotification('warning', 'The rest of the party waits for you to skip or finish the trailer', States.watchingTrailer);
    }
});

listenToWindowEvent('play-video', async (ev) => {
    if (ev.data.coordinated) {
        sendNotification('info', 'Everyone is in sync', 'Resumed', States.playing);
    } else {
        const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
        sendNotification('info', memberName + ' resumed', States.playing);
    }
});

listenToWindowEvent('seek-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    sendNotification('info', memberName + ' seeked to another time', 'seek');
});

listenToWindowEvent('close-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMember.displayName : 'You';
    sendNotification('warning', memberName + ' closed the video', 'close');
});

listenToWindowEvent('member-change', async (ev) => {
    let memberName = 'You';
    if (ev.data.remote && ev.data.member.displayName !== displayName) {
        memberName = ev.data.member.displayName;
    }

    if (ev.data.change === 'join') {
        // Do not show notification if the member joined back within 2 seconds
        if (removeLeavingMember(memberName)) return;
        sendNotification('success', memberName + ' joined the party!', 'join');
    } else if (ev.data.change === 'leave') {
        // Only show notification if the member does not rejoin within 2 secs
        leavingMembers.push(memberName);
        setTimeout(() => {
            if (leavingMembers.includes(memberName)) {
                removeLeavingMember(memberName);
                sendNotification('error', memberName + ' left the party', 'leave');
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