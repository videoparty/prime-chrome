/**
 * Inject the PvP sidebar in the page
 * after the user joined the party
 */
let sidebarInitialized = false;
listenToWindowEvent('member-change', async (ev) => {
    if (ev.data.change !== 'join' || sidebarInitialized ||
        (window.isOnAmazonWebsite && !(await isOnPrimeVideoSection()))) return;
    await initializeSidebar(ev);
});

async function initializeSidebar() {
    const sidebarSrc = chrome.runtime.getURL('src/sidebar/sidebar.html');
    const sidebarClass = window.isOnAmazonWebsite ? '' : 'primevideo';
    jQuery('body')
        .css('display', 'flex')
        .append('' +
            '<div id="pvp-sidebar" class="' + sidebarClass + '">' +
            '<iframe id="pvp-sidebar-iframe" src="' + sidebarSrc + '"></iframe>' +
            '</div>');
    jQuery('#a-page').css('transition', 'width 1s ease-in-out').css('width', '100%');

    // If there is a player, move the sidebar into the player
    setTimeout(() => {
        moveSidebar();
    }, 100);

    // I like animations
    setTimeout(() => {
        alignSidebarWidth('15%');
    }, 150);

    setTimeout(() => {
        const sidebar = jQuery('#pvp-sidebar');
        if ((player || isPlayingTrailer()) && !sidebar.hasClass('player-mode')) {
            postWindowMessage({type: 'start-video'}, getSidebarIframe().contentWindow);
            sidebar.addClass('player-mode');
        }
    }, 5000); // Just to make sure it's not missing the 'start-video' message

    // Watcher is changing the theme
    startWebplayerWatcher();
    sidebarInitialized = true;
}

/**
 * Sidebar is asking for current state
 */
listenToWindowEvent('sidebar-request-init', () => {
    const changes = getStateChanges();
    postWindowMessage({
        type: 'sidebar:state-init',
        changes,
        members: currentParty.members,
        playerMode: jQuery('#pvp-sidebar').hasClass('player-mode')
    }, getSidebarIframe().contentWindow);
});

/**
 * Adjusts the PvP sidebar theme when the webplayer opens or closes.
 */
function startWebplayerWatcher() {
    if (player || isPlayingTrailer()) {
        alignSidebarWidth('15%');
    }

    listenToWindowEvent('start-video', () => {
        const sidebar = jQuery('#pvp-sidebar');
        sidebar.addClass('player-mode');
        alignSidebarWidth('15%');
    });

    listenToWindowEvent('close-video', () => {
        const sidebar = jQuery('#pvp-sidebar');
        sidebar.removeClass('player-mode');
        alignSidebarWidth('15%');
    });
}

/**
 * Adjust sidebar width and makes sure the webplayer width is aligned.
 * Will move the sidebar inside the player element, to support fullscreen
 * @param sidebarWidth like '300px' or '15%'
 */
function alignSidebarWidth(sidebarWidth) {
    jQuery('#a-page').css('width', 'calc(100% - ' + sidebarWidth + ')');
    jQuery('#pvp-sidebar').css('width', sidebarWidth);

    if (isLegacyWebPlayer()) {
        const webPlayer = jQuery('#dv-web-player');
        if (webPlayer.length > 0) {
            webPlayer.css('width', 'calc(100% - ' + sidebarWidth + ')');
        }
    } else {
        // Support full screen sidebar in new webplayer
        const webPlayerElements = jQuery('#dv-web-player .webPlayerSDKContainer .scalingVideoContainer, #dv-web-player .webPlayerSDKContainer .webPlayerSDKUiContainer');
        if (webPlayerElements.length === 2) {
            webPlayerElements.css('width', 'calc(100% - ' + sidebarWidth + ')');
        }
    }

    moveSidebar();
}

/**
 * Move sidebar into the player element, to support fullscreen.
 * If sidebar does not exist, will create a new one.
 */
async function moveSidebar() {
    if (isLegacyWebPlayer()) return;

    const sidebar = jQuery('#pvp-sidebar');
    if (sidebar.length === 0) {
        console.log('Tried to move an non-existing sidebar, creating a new one.');
        await initializeSidebar();
    }

    if (sidebar.hasClass('player-mode') && !sidebar.parent().hasClass('webPlayerSDKContainer')) {
        sidebar.appendTo('#dv-web-player .webPlayerSDKContainer');
    } else if (!sidebar.hasClass('player-mode') && sidebar.parent().hasClass('webPlayerSDKContainer')) {
        sidebar.appendTo('body');
    }
}