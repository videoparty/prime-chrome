/**
 * This file listens to all remote actions and displays notifications accordingly
 */

listenToWindowEvent('start-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMemberName : 'You';
    sendNotification('info', memberName + ' started a video', 'Loading..');
});

listenToWindowEvent('pause-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMemberName : 'You';
    sendNotification('info', memberName + ' paused');
});

listenToWindowEvent('play-video', async (ev) => {
    if (ev.data.coordinated) {
        sendNotification('info', 'Everyone is in sync', 'Resumed');
    } else {
        const memberName = ev.data.remote ? ev.data.byMemberName : 'You';
        sendNotification('info', memberName + ' resumed');
    }
});

listenToWindowEvent('seek-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMemberName : 'You';
    sendNotification('info', memberName + ' seeked to another time');
});

listenToWindowEvent('close-video', async (ev) => {
    const memberName = ev.data.remote ? ev.data.byMemberName : 'You';
    sendNotification('warning', memberName + ' closed the video');
});

listenToWindowEvent('member-change', async (ev) => {
    const memberName = ev.data.remote ? ev.data.member.displayName : 'You';
    if (ev.data.change === 'join') {
        if (ev.data.pause && player) {
            sendNotification('success', memberName + ' joined the party! Waiting for ' + memberName + ' to sync up..');
        } else {
            sendNotification('success', memberName + ' joined the party!');
        }
    } else if (ev.data.change === 'leave') {
        sendNotification('error', memberName + ' left the party');
    }
});