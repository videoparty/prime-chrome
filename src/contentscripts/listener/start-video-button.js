/**
 * When opening up the site, you can either start a video
 * from the dashboard or from a detail page.
 *
 * This file listens to all those 'start video' clicks and
 * broadcasts a message about it.
 */

let lastClickedPlayItem;
(
    function () {
        // Circle is the 'start video' button element on the homepage,
        // but somehow we can't listen on elements inside svg's.. So listen to everything.
        jQuery('*').click(function (ev) {
            const aLink = jQuery(ev.target).closest('a');
            if (aLink.length === 0) return;

            const playData = splitPlayUrl(aLink.attr('href'));
            if (playData !== null && playData.autoplay !== undefined && lastClickedPlayItem !== playData.videoId) {
                postStartVideoMessage(playData);
                lastClickedPlayItem = playData.videoId;
            }
        });

        // The other one is listening specifically to an a-element, acting
        // as a 'start video' button on detail pages.
        jQuery('a').click(function () {
            const playData = splitPlayUrl(jQuery(this).attr('href'));
            if (playData !== null && playData.autoplay !== undefined) {
                postStartVideoMessage(playData);
            }
        });

        function postStartVideoMessage(playData) {
            if (!currentParty) return;
            postWindowMessage({
                type: 'start-video',
                videoId: playData.videoId,
                ref: playData.ref,
                time: playData.time
            });
        }
    }
)();