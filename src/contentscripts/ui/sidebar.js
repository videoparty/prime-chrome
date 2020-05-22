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
    jQuery('body')
        .css('display', 'flex')
        .append('' +
            '<div id="pvp-sidebar">' +
            '<iframe id="pvp-sidebar-iframe" src="' + sidebarSrc + '"></iframe>' +
            '</div>');
    jQuery('#a-page').css('transition', 'width 1s ease-in-out').css('width', '100%');

    // I like animations
    setTimeout(() => {
        jQuery('#pvp-sidebar').css('width', '15%');
        jQuery('#a-page').css('width', '85%');
    }, 1000);

    setTimeout(() => {
        const sidebar = jQuery('#pvp-sidebar');
        if ((player || isPlayingTrailer()) && !sidebar.hasClass('player-mode')) {
            adjustPlayerWidth('85%');
            postWindowMessage({type: 'start-video'}, getSidebarIframe().contentWindow);
            sidebar.addClass('player-mode');
        }
    }, 5000); // Just to make sure it's not missing the 'start-video' message

    // Watcher is changing the theme
    startWebplayerWatcher();
    sidebarInitialized = true;
}

/**
 * Sidebar is asking for party data
 */
listenToWindowEvent('sb-get-current-party', () => {
    postWindowMessage({type: 'party-info', currentParty}, getSidebarIframe().contentWindow);
});

/**
 * Adjusts the PvP sidebar theme when the webplayer opens or closes.
 */
function startWebplayerWatcher() {

    if (player) {
        adjustPlayerWidth('85%');
    }

    listenToWindowEvent('start-video', () => {
        const sidebar = jQuery('#pvp-sidebar');
        sidebar.addClass('player-mode');
        adjustPlayerWidth('85%');
    });

    listenToWindowEvent('close-video', () => {
        const sidebar = jQuery('#pvp-sidebar');
        sidebar.removeClass('player-mode');
    });
}

function adjustPlayerWidth(sidebarWidth) {
    const webPlayer = jQuery('#dv-web-player');
    if (webPlayer.length > 0) {
        webPlayer.css('width', sidebarWidth);
    }
}