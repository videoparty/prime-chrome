/**
 * Adjusts the PvP sidebar theme when the webplayer opens or closes.
 */

listenToWindowEvent('start-video', () => {
    const sidebar = jQuery('body');
    sidebar.addClass('player-mode');
});

listenToWindowEvent('close-video', () => {
    const sidebar = jQuery('body');
    sidebar.removeClass('player-mode');
});

jQuery('html')
    .mouseenter(() => {
        jQuery('html').addClass('active')
    })
    .mouseleave(() => {
        jQuery('html').removeClass('active');
    });