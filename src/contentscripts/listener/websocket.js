/**
 * Mediating events between websocket and the window
 */

const websocketUrl = 'https://ws.primevideoparty.com';
let currentParty; // = {id: string, members: {id: string, displayName: string}[], videoId: string}
let socket;
let displayName;
let askForStoreReview; // {readyToAsk: bool, browser: 'chrome'|'edge'} or undefined

/**
 * Listen to contentscript, background / popup extension events
 */
window.addEventListener('message', async function (ev) {
    if (ev.data.remote) {
        return; // Only listen to all local contentScript events
    }

    if (ev.data.type === 'party-info' && ev.data.isNew) {
        // In case the user opens the extension for the first time in browser session,
        // or when the user clicks the 'new party' button.

        if (currentParty && socket) {
            socket.emit('leave-party', {});
        }

        let baseUrl = '';
        if (window.isOnAmazonWebsite) {
            baseUrl = '/gp/video/storefront';
        }
        window.location.href = baseUrl + '/?pvpartyId=' + ev.data.partyId;
        return;
    }

    if (window.isOnAmazonWebsite && !(await isOnPrimeVideoSection())) {
        return; // Only when primevideo section is open
    }

    if (!socket && ev.data.type === 'party-info') {
        // When the user surfs to another page but is already in a party
        displayName = await getDisplayName();
        askForStoreReview = ev.data.askForStoreReview;
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
        case 'copy-party-url': // Clicked the 'copy' button in the popup
            copyPartyUrl();
            sendMessageToRuntime({type: 'copy-confirm'});
            break;
        case 'chat':
            socket.emit('chat', {message: ev.data.message});
            break;
        case 'displayname':
            displayName = ev.data.displayName;
            break;
        case 'set-displayname':
            if (ev.data.displayName.length === 0) return;
            sendMessageToRuntime({type: 'bg:set-displayname', displayName: ev.data.displayName});
            socket.emit('update-displayname', {displayName: ev.data.displayName});
            postWindowMessage({
                type: 'update-displayname',
                old: displayName ? displayName : socket.id,
                new: ev.data.displayName,
                remote: true
            });
            displayName = ev.data.displayName;
            break;
        case 'watching-trailer':
            socket.emit('watching-trailer');
            break;
        case 'seek-video':
            socket.emit('seek-video', {
                time: ev.data.time,
                isLegacyPlayer: isLegacyWebPlayer()
            });
            break;
        case 'start-video':
            socket.emit('start-video', {
                videoId: ev.data.videoId,
                ref: ev.data.ref,
                time: ev.data.time,
                isLegacyPlayer: isLegacyWebPlayer()
            });
            break;
        case 'pause-video':
            socket.emit('pause-video', {
                time: ev.data.time,
                isLegacyPlayer: isLegacyWebPlayer(),
                reason: ev.data.reason
            });
            break;
        case 'state-update':
            socket.emit('state-update', {state: ev.data.state});
            break;
        case 'play-video':
            socket.emit('play-video');
            break;
        case 'next-episode':
            socket.emit('next-episode', {season: ev.data.season, episode: ev.data.episode});
            break;
        case 'close-video':
            socket.emit('close-video');
            break;
        case 'join-party':
            currentParty = undefined; // Wait for a confirmation from the server
            socket.emit('join-party', {partyId: ev.data.partyId});
            break;
        case 'leave-party': // I leave my party
            currentParty = undefined;
            socket.emit('leave-party', {});
            break;
    }
}, false);

/**
 * Initialize the websocket and respond to all events.
 * This is triggered when opening the extension.
 */
function initializeWebsocket(partyId) {
    currentParty = {id: partyId, members: [] };
    socket = io(websocketUrl);
    socket.on('connect', () => {
        let joinArgs = {displayName, partyId};
        if (player && currentParty.videoId) {
            joinArgs.videoId = currentParty.videoId;
        }
        socket.emit('join-party', joinArgs);
    });
    socket.on('play-video', (data) => {
        postWindowMessage({
            type: 'play-video',
            coordinated: data.coordinated,
            byMember: data.byMember,
            remote: true
        })
    });
    socket.on('state-update', (data) => {
        postWindowMessage({
            type: 'state-update',
            byMember: data.byMember,
            state: data.state,
            remote: true
        })
    });
    socket.on('update-displayname', (data) => {
        postWindowMessage({
            type: 'update-displayname',
            old: data.old,
            new: data.new,
            remote: true
        })
    });
    socket.on('join-party', (data) => {
        currentParty.members = data.currentMembers;
        for (let member of currentParty.members) {
            if (member.id !== socket.id) continue;
            member.isMe = true;
            break;
        }

        postWindowMessage({
            type: 'member-change',
            change: 'join',
            member: data.member,
            pause: data.pause,
            currentParty,
            remote: true
        })
    });
    socket.on('left-party', (data) => {
        currentParty.members = data.currentMembers;
        postWindowMessage({
            type: 'member-change',
            change: 'leave',
            member: data.member,
            currentParty,
            remote: true
        })
    });
    socket.on('pause-video', (data) => {
        postWindowMessage({
            type: 'pause-video',
            byMember: data.byMember,
            time: data.time,
            isLegacyPlayer: data.isLegacyPlayer,
            remote: true
        })
    });
    socket.on('next-episode', (data) => {
        postWindowMessage({
            type: 'next-episode',
            byMember: data.byMember,
            season: data.season,
            episode: data.episode,
            remote: true
        });
    });
    socket.on('chat', (data) => {
        postWindowMessage({
            type: 'chat',
            byMember: data.byMember,
            message: data.message,
            remote: true
        });
    });
    socket.on('watching-trailer', (data) => {
        postWindowMessage({
            type: 'watching-trailer',
            byMember: data.byMember,
            remote: true
        })
    });
    socket.on('seek-video', (data) => {
        postWindowMessage({
            type: 'seek-video',
            byMember: data.byMember,
            time: data.time,
            isLegacyPlayer: data.isLegacyPlayer,
            remote: true
        })
    });
    socket.on('close-video', (data) => {
        postWindowMessage({
            type: 'close-video',
            byMember: data.byMember,
            remote: true
        })
    });
    socket.on('start-video-for-member', (data) => {
        // The server is asking us for the current time so another member can join in sync
        // If the currentTime in legacy webplayer = -10 seconds for new webplayer
        data.isLegacyPlayer = isLegacyWebPlayer();
        data.time = player ? player.currentTime - currentTimeOffset : 0;
        socket.emit('start-video-for-member', data);
    });
    socket.on('start-video', (data) => {
        const currentUrlData = splitPlayUrl(window.location.href);
        if (currentUrlData !== null
            && currentUrlData.videoId === data.videoId
            && !webPlayerWasClosed) {
            currentParty.videoId = data.videoId;
            postWindowMessage({
                type: 'start-video',
                videoId: data.videoId,
                ref: data.ref,
                time: data.time,
                isLegacyPlayer: data.isLegacyPlayer,
                byMember: data.byMember,
                remote: true
            });
        } else {
            let startTime = data.time || 0;
            let urlBase = 'https://www.primevideo.com';
            if (window.isOnAmazonWebsite) {
                urlBase = new URL(window.location).origin + '/gp/video';
            }
            window.location.href = urlBase + '/detail/' + data.videoId + '/ref=' + data.ref + '?autoplay=1&t=' + startTime;
        }
    });

    // Socket error handling
    socket.on('reconnecting', (attemptNr) => {
        if (attemptNr === 1) {
            sendNotification('error', undefined, 'The server might be in the process of updating. Sorry for the inconvenience.', 'error', 'Lost connection');
        }
    });
}
