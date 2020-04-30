/**
 * Import toastr css into the webpage and configure toastr
 */
jQuery(document).ready(() => {
    jQuery('head').append('' +
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.css">' +
        '');
});

toastr.options.escapeHtml = true;
toastr.options.positionClass = 'toast-top-center';
toastr.options.preventDuplicates = true;