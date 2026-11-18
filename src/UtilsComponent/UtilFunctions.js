import $ from 'jquery';

export const image2svg = () => {
    try {
        jQuery('.in__svg').each(function (i, e) {
            var $img = jQuery(e);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function (data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');
                // Add replaced image's ID to the new SVG
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if (typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', ' ' + imgClass + ' replaced-svg');
                }
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');
                // Replace image with new SVG
                $img.replaceWith($svg);
            }, 'xml');
        });
    }
    catch (err) {
        console.log(err);
    }
}

export const numberCounter = () => {
    jQuery('.counter').each(function () {
        jQuery(this).prop('Counter', 0).animate({
            Counter: jQuery(this).text()
        }, {
            duration: 6000,
            easing: 'swing',
            step: function (now) {
                now = Number(Math.ceil(now)).toLocaleString('en');
                jQuery(this).text(now);
            }
        });
    });
}

export const menu = () => {
    // Mobile Menu JS
    $(".mobile-menu").click(function () {
        $(".sidebar").toggleClass("show");
    });
    // Mobile Menu JS

    // Submenu Menu JS
    $(".side-nav-item.has-child > .side-nav-link").click(function () {
        if ($(".side-nav-item.has-child").hasClass("active")) {
            $(".side-nav-item.has-child").toggleClass("active");
        } else {
            $(".side-nav-item.has-child").toggleClass("active");
        }
    });
    // Submenu Menu JS

    // Mobile Search Toggle JS
    jQuery(document).ready(function () {
        $('.form-group .search-icon').click(function () {
            if ($(window).width() < 991) {
                $('.header-action-form form .form-control').slideToggle();
            }
        });
    });
    // Mobile Search Toggle JS

}