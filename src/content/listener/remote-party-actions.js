/**
 * This file listens to all remote actions and displays notifications accordingly
 */

listenToWindowEvent('start-video', async (ev) => {
    if (!ev.data.remote) {return}
    sendNotification('info', ev.data.byMemberName + ' started a video', 'Loading..');
});

listenToWindowEvent('pause-video', async (ev) => {
    if (!ev.data.remote) {return}
    sendNotification('info', ev.data.byMemberName + ' paused');
});

listenToWindowEvent('play-video', async (ev) => {
    if (!ev.data.remote) {return}
    if (ev.data.byMemberName) {
        sendNotification('info', ev.data.byMemberName + ' resumed');
    } else if (ev.data.coordinated) {
        sendNotification('info', 'Everyone is in sync', 'Resumed');
    }
});

listenToWindowEvent('seek-video', async (ev) => {
    if (!ev.data.remote) {return}
    sendNotification('info', ev.data.byMemberName + ' seeked to another time');
});

listenToWindowEvent('close-video', async (ev) => {
    if (!ev.data.remote) {return}
    sendNotification('warning', ev.data.byMemberName + ' closed the video');
});

listenToWindowEvent('member-change', async (ev) => {
    if (!ev.data.remote) {return}
    if (ev.data.change === 'join') {
        if (ev.data.pause && player) {
            sendNotification('success', ev.data.member.displayName + ' joined the party! Waiting for ' + ev.data.member.displayName + ' to sync up..');
        } else {
            sendNotification('success', ev.data.member.displayName + ' joined the party!');
        }
    } else if (ev.data.change === 'leave') {
        sendNotification('error', ev.data.member.displayName + ' left the party');
    }
});