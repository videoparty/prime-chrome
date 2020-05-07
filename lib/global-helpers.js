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
 * Performs a window.postMessage and
 * also for the sidebar iframe window
 * (if present).
 */
function postWindowMessage(message) {
    const pvpSidebar = document.getElementById('pvp-sidebar-iframe');
    if (pvpSidebar) {
        pvpSidebar.contentWindow.postMessage(message, '*');
    }
    window.postMessage(message, '*');
}