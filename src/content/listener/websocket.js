/**
 * Mediating events between websocket and the window
 */

const websocketUrl = 'https://ws.primevideoparty.com';
let currentPartyId;
let socket;

const joinPartyId = getPartyQueryParameter(); // To check if the user is joining a party through the URL
if (joinPartyId) {
    chrome.runtime.sendMessage({type: 'join-party', partyId: joinPartyId});
} else {
    chrome.runtime.sendMessage({type: 'get-party', createNew: false});
}

/**
 * Listen to contentscript, background / popup extension events
 */
window.addEventListener('message', function (ev) {
    if (ev.data.remote) {
        return; // Only listen to all local contentScript events
    }

    if (ev.data.type === 'party-info' && ev.data.isNew) {
        // In case the user opens the extension for the first time in browser session,
        // or when the user clicks the 'new party' button.
        window.location.href = 'https://primevideo.com?pvpartyId=' + ev.data.partyId;
    } else if (!socket && ev.data.type === 'party-info') {
        // When the user surfs to another page but is already in a party
        initializeWebsocket(ev.data.partyId);
        return;
    }

    if (!socket) {
        return; // Don't do anything if the socket isn't active
    }

    switch (ev.data.type) {
        case 'player-ready':
            socket.emit('player-ready');
            break;
        case 'watching-trailer':
            socket.emit('watching-trailer');
            break;
        case 'seek-video':
            socket.emit('seek-video', {time: ev.data.time});
            break;
        case 'start-video':
            socket.emit('start-video', {
                videoId: ev.data.videoId,
                ref: ev.data.ref,
                time: ev.data.time
            });
            break;
        case 'pause-video':
            socket.emit('pause-video', {time: ev.data.time});
            break;
        case 'play-video':
            socket.emit('play-video');
            break;
        case 'close-video':
            socket.emit('close-video');
            break;
        case 'join-party':
            currentPartyId = ev.data.partyId;
            socket.emit('join-party', {partyId: ev.data.partyId});
            break;
        case 'leave-party': // I leave my party
            currentPartyId = undefined;
            socket.emit('leave-party', {});
            break;
    }
}, false);

/**
 * Initialize the websocket and respond to all events.
 * This is triggered when opening the extension.
 */
function initializeWebsocket(partyId) {
    currentPartyId = partyId;
    socket = io(websocketUrl);
    socket.on('connect', () => {
        socket.emit('join-party', {partyId});
    });
    socket.on('play-video', () => {
        window.postMessage({type: 'play-video', remote: true}, '*')
    });
    socket.on('pause-video', (data) => {
        window.postMessage({type: 'pause-video', time: data?.time, remote: true}, '*')
    });
    socket.on('seek-video', (data) => {
        window.postMessage({type: 'seek-video', time: data.time, remote: true}, '*')
    });
    socket.on('close-video', () => {
        window.postMessage({type: 'close-video', remote: true}, '*')
    });
    socket.on('start-video-for-member', (data) => {
        // The server is asking us for the current time so another member can join in sync
        // Send our currentTime minus 10 seconds because the webplayer always starts at 10sec..
        data.time = player ? player.currentTime - 10 : 0;
        socket.emit('start-video-for-member', data);
    });
    socket.on('start-video', (data) => {
        const currentUrlData = splitPlayUrl(window.location.href);
        if (currentUrlData !== null && currentUrlData.videoId.length >= 2 && currentUrlData.videoId === data.videoId) {
            window.postMessage({
                type: 'start-video',
                videoId: data.videoId,
                ref: data.ref,
                time: data.time,
                remote: true
            }, '*');
        } else {
            let startTime = data.time || 0;
            window.location.href = 'https://www.primevideo.com/detail/' + data.videoId + '/ref=' + data.ref + '?autoplay=1&t=' + startTime;
        }
    });
}