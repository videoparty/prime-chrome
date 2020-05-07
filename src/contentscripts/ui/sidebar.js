/**
 * Inject the PvP sidebar in the page
 * after the user joined the party
 */
let sidebarInitialized = false;
listenToWindowEvent('member-change', async (ev) => {
    if (ev.data.change !== 'join' || sidebarInitialized ||
        (window.isOnAmazonWebsite && !(await isOnPrimeVideoSection()))) return;
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

    startWebplayerWatcher();
    sidebarInitialized = true;
});

/**
 * Adjusts the PvP sidebar theme when the webplayer opens or closes.
 */
function startWebplayerWatcher() {
    listenToWindowEvent('start-video', () => {
        const sidebar = jQuery('#pvp-sidebar');
        sidebar.addClass('player-mode');
        adjustPlayerWidth(sidebar.css('width'));
    });

    listenToWindowEvent('close-video', () => {
        const sidebar = jQuery('#pvp-sidebar');
        sidebar.removeClass('player-mode');
        adjustPlayerWidth(sidebar.css('width'));
    });

    function adjustPlayerWidth(sidebarWidth) {
        const webPlayer = jQuery('#dv-web-player');
        if (webPlayer.length > 0) {
            webPlayer.css('width', 'calc(100% - ' + sidebarWidth + ')');
        }
    }
}