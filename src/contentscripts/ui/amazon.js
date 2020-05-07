/**
 * This file loads if the user is on a amazon website,
 * not on primevideo.com.
 */
window.isOnAmazonWebsite = true;

async function isOnPrimeVideoSection () {
    return new Promise((resolve) => {
        jQuery(document).ready(() =>{
            resolve(document.title.includes('Prime Video'));
        });
    });
}
