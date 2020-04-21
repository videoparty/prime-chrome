/**
 * Transforms incoming background/extension messages to window messages
 */
(
    function () {
        chrome.extension.onMessage.addListener(function(msg) {
            window.postMessage(msg, '*');
        });
    }
)();