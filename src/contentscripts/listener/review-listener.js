/**
 * When a user gets the webstore review message served,
 * listen here to what the user wants to do and update
 * the state accordingly.
 * For example, the user can postpone the review or
 * wishes not to be reminded again.
 */

listenToWindowEvent('store-review-change', (ev) => {
    sendMessageToRuntime({type: 'set-review-status', status: ev.data.status}); // Send to background script
});
