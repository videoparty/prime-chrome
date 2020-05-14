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
 * Target defaults to the window in the current scope
 * and, if available, the sidebar
 */
function postWindowMessage(message, target = undefined) {
    if (target === undefined) {
        const sidebar = getSidebarIframe();
        if (sidebar) {
            sidebar.contentWindow.postMessage(message, '*');
        }
        window.postMessage(message, '*');
    } else {
        target.postMessage(message, '*');
    }
}

/**
 * Get the contentWindow of the sidebar iframe
 */
function getSidebarIframe() {
    return document.getElementById('pvp-sidebar-iframe');
}