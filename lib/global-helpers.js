/**
 * Listen to a specific window event.
 * An optional timeout delays calling the callback function.
 */
function listenToWindowEvent(type, callback, timeout = 1) {
    window.addEventListener('message', function (ev) {
        if (ev.data.type === type) {
            setTimeout(() => {
                callback(ev)
            }, timeout);
        }
    }, false);
}

/**
 * Performs a postMessage to the given target.
 * Target defaults to the window in the current scope.
 */
function postWindowMessage(message, target = window) {
    target.postMessage(message, '*');
}