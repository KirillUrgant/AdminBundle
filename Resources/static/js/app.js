import $ from 'jquery';

var searchTimer;

var toggleMenu = function () {
    $('.modules__item').show();
    if ($('.modules').toggle().css('display') == 'block') {
        $('.modules__search').focus();
    }
    $('.main').toggle();
    $('.header--button__menu').closest('a').toggleClass('active');
};

var showMenu = function () {
    $('.modules__item').show();
    $('.modules').show();
    $('.main').hide();
    $('.header--button__menu').closest('a').addClass('active');
    $('.modules__search').focus();
};

var hideMenu = function () {
    $('.modules').hide();
    $('.main').show();
    $('.header--button__menu').closest('a').removeClass('active');
};

var updateTimer;

$(document)
    .on('click', '.header--button__menu', function (e) {
        toggleMenu();
    })
    .on('click', function (e) {
        var $this = $(e.target);
        if (
            $this.closest('.header--button__menu').length == 0 &&
            $this.closest('.modules').length == 0
        ) {
            hideMenu();
        }
    })
    // Table check all checkboxes
    .on('click', 'table thead th.check.all [type="checkbox"]', function (e) {
        var $this = $(this);
        $this.prop('checked', !$this.prop('checked')).closest('table').checkboxes('toggle');
    })
    .on('keydown', '.table--toolbar .search input', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    })
    .on('keyup', '.modules__search', function (e) {
        var value = convertRu().fromEn(e.target.value.toLowerCase());
        $('.modules__item a').each(function(i, el) {
            var $el = $(el),
                $container = $el.closest('.modules__item');
            if ($el.text().toLowerCase().indexOf(value) == -1) {
                $container.hide();
            } else {
                $container.show();
            }
        });
    })
    .on('keydown', function (e) {
        if (e.keyCode == 27) {
            hideMenu();
        }
    })
    .on('keyup', '.table--toolbar .search input', function (e) {
        e.preventDefault();
        var searchVar = 'search';
        var $this = $(this);

        clearTimeout(updateTimer);
        updateTimer = setTimeout(function () {
            $('.table--loader').show();
            $.ajax({
                url: window.location.pathname + '?' + searchVar + '=' + $this.val(),
                success: function (html) {
                    $('.table--loader').hide();
                    $('.table--container__main').replaceWith($(html).find('.table--container__main'));
                }
            });
        }, 300);

        return false;
    })
    .on('keyup', '#search-input', function (e) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
            $.ajax({
                url: '',
                type: 'POST',
                data: {
                    search: e.target.value
                },
                success: function (data) {
                    $('#main-form').replaceWith(data);
                    var $searchInput = $('#search-input');
                    $searchInput.focus().val($searchInput.val());
                }
            })
        }.bind(this), 550);
    });

$(() => {
    $.mtooltip('[rel~=tooltip]');

    var selector = '',
        types = ['jpg', 'jpeg', 'png', 'gif'];
    for (var i = 0; i < types.length; i++) {
        selector += "a[href$='." + types[i].toLowerCase() + "']:not(.ignore-fancy),a[href$='." + types[i].toUpperCase() + "']:not(.ignore-fancy)";
        if (i + 1 != types.length) {
            selector += ",";
        }
    }

    var $linkWithImage = $(selector);
    $linkWithImage
        .attr('rel', 'fancybox')
        .fancybox({
            openEffect: 'elastic',
            closeEffect: 'elastic',
            helpers: {
                title: {
                    type: 'inside'
                },
                buttons: {}
            }
        });
});
