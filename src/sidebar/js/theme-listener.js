/**
 * Adjusts the PvP sidebar theme when the webplayer opens or closes.
 */

listenToWindowEvent('start-video', () => {
    const sidebar = jQuery('html');
    sidebar.addClass('player-mode');
});

listenToWindowEvent('play-video', () => {
    const sidebar = jQuery('html');
    if (!sidebar.hasClass('player-mode')) {
        sidebar.addClass('player-mode');
    }
});

listenToWindowEvent('close-video', () => {
    const sidebar = jQuery('html');
    sidebar.removeClass('player-mode');
});

jQuery('html')
    .mouseenter(() => {
        jQuery('html').addClass('active')
    })
    .mouseleave(() => {
        jQuery('html').removeClass('active');
    });