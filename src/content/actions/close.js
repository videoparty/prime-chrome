/**
 * This file listens every half asecond when the
 * current video player was closed (or by other members)
 */

let closeChecker;

(
    function () {
        listenToWindowEvent('close-video', async () => {
            const closeButton = jQuery('.closeButtonWrapper');
            if (player && closeButton.length > 0) {

                // todo fix problem: close-video is triggered when leaving/reloading the page
                closeButton.click(); // todo: this doesn't work
                clearInterval(closeChecker);
                player.onpause = undefined;
                await player.pause();
                player = undefined;
                //window.location.href = 'https://primevideo.com';

                // var eventOptions = {
                //     'bubbles': true,
                //     'button': 0,
                //     'currentTarget': closeButton[0]
                // };
                // closeButton[0].dispatchEvent(new MouseEvent('mousemove', eventOptions));

                // player.onpause = undefined;
                // player.pause();
                // jQuery('#dv-web-player').css('display', 'none');
                // clearInterval(closeChecker);
                // player = undefined;
            }
        });
    }
)();

/**
 * Listen to when the webplayer disappears
 */
function startCloseListener() {
    if (closeChecker !== undefined) return;
    closeChecker = setInterval(() => {
        const playerObj = jQuery('.webPlayerContainer video[src]')[0];
        if (!playerObj || jQuery(playerObj).css('visibility') === 'hidden') {
            // todo fix problem: close-video is triggered when leaving/reloading the page
            //window.postMessage({type: 'close-video'}, '*');
            clearInterval(closeChecker);
        }
    }, 500);
}