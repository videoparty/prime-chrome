/**
 * Mediating events between websocket and the window
 */

let currentPartyId;

(
    function () {
        // -- Listen to socket events
        const socket = io('https://ws.primevideoparty.com');
        socket.on('connect', () => {
            const joinPartyId = getPartyQueryParameter(); // To check if the user is joining a party through the URL
            if (joinPartyId) {
                chrome.runtime.sendMessage({type: 'join-party', partyId: joinPartyId});
            } else {
                chrome.runtime.sendMessage({type: 'get-party'});
            }
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
            data.time = player ? player.currentTime-10 : 0;
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
                window.location.href = 'https://www.primevideo.com/detail/'+data.videoId+'/ref='+data.ref+'?autoplay=1&t='+startTime;
            }
        });



        // -- Listen to contentscript, background / popup extension events
        window.addEventListener('message', function (ev) {
            if (!ev.data.remote) {
                // Listen to all local contentScript events
                switch (ev.data.type) {
                    case 'player-ready':
                        socket.emit('player-ready');
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
                    case 'party-info':
                        if (currentPartyId !== ev.data.partyId) {
                            currentPartyId = ev.data.partyId;
                            socket.emit('leave-party', {});
                            socket.emit('join-party', {partyId: ev.data.partyId});
                        }
                        break;
                    case 'leave-party': // I leave my party
                        currentPartyId = undefined;
                        socket.emit('leave-party', {});
                        break;
                }
            }
        }, false);
    }
)();