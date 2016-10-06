// Expose jQuery and $
import $ from 'expose?$!expose?jQuery!jquery';

// Expose underscore
import 'expose?underscore!expose?_!lodash';

// Expose moment
import 'expose?moment!moment';
import 'moment/locale/ru';

// Expose pikaday-time (pikaday with time support)
import 'expose?Pikaday!pikaday-time';

// Expose Chartist
import 'expose?Chartist!chartist';
import 'expose?Chartist.plugins.legend!chartist-plugin-legend';

// Expose flow.js File API upload library
import 'expose?Flow!@flowjs/flow.js';

// Expose jquery-ui sortable
// import 'expose?sortable!jquery-ui/sortable';

// Expose checkboxes.js
import 'expose?checkboxes!checkboxes.js/src/jquery.checkboxes.js';

// Expose CodeMirror
import CodeMirror from 'expose?CodeMirror!codemirror';
import 'codemirror/mode/jinja2/jinja2';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/htmlmixed/htmlmixed.js';

import convertRu from 'convert-layout/ru';

import './components/jscolor';
import './components/tooltip';
import './csrf';
import './components/select/jquery.select';
import './components/order/jquery.order_form';
import './components/files';

// Expose fetch component
import 'expose?fetch!./components/fetch';

import 'expose?JsonTable!./components/json_table';
import Modal from './components/modal';

import './file';
import './components/mnotify';

let isCheckedTable = () => {
    let checked = false,
        $elements = $('table tbody td.check [type="checkbox"]');
    for (let i = 0; i < $elements.length; i++) {
        if ($elements[i].checked) {
            checked = true;
            break;
        }
    }
    return checked;
};

window.insertNewOption = (htmlId, pk, value) => {
    let option = document.createElement("option");
    option.text = value;
    option.value = pk;
    option.selected = true;
    let select = document.getElementById(htmlId);
    select.appendChild(option);
};

let updateTimer;

$(document)
    .on('click', '.create-popup-form', e => {
        e.preventDefault();
        let $this = $(e.target).closest('a'),
            id = $this.data('id'),
            url = $this.data('url') + '?popup=true&popup_id=' + id,
            width = 850,
            height = 650,
            left = screen.width / 2 - (height / 2),
            top = screen.height / 2 - (width / 2),
            options = 'directories=0, titlebar=0, toolbar=0, location=0, status=0, menubar=0, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left;

        window.open(url, '_blank', options);
    })
    .on('click', '.flash-list .remove', e => {
        e.preventDefault();
        $(e.target).closest('li').hide();
    })
    .on('click', '[data-confirm]', function (e) {
        let $this = $(e.target).closest('a');
        if (!confirm($this.attr('data-confirm'))) {
            e.preventDefault();
            return false;
        }
    })
    .on('submit', '.actions-form', e => {
        e.preventDefault();

        let $form = $(e.target).closest('form'),
            $action = $form.find('[name=action]');

        let models = [];
        $('table tbody td.check :checkbox').filter(':not(:disabled)').each((i, el) => {
            let $el = $(el);
            if ($el.prop('checked')) {
                models.push($el.val());
            }
        });

        fetch
            .post($form.attr('action') + $action.val(), {}, {'models[]': models})
            .then(data => window.location.reload());
    })

    // Table checkboxes
    .on('click', 'table thead th.check.all [type="checkbox"]', e => {
        var $this = $(e.target);
        if (isCheckedTable()) {
            $this.prop('checked', false).closest('table').checkboxes('uncheck');
            $('.actions--container').hide();
        } else {
            $this.prop('checked', true).closest('table').checkboxes('check');
            $('.actions--container').show();
        }
    })
    .on('click', 'table tbody td.check [type="checkbox"]', e => {
        let checked = isCheckedTable();
        $('table thead th.check.all [type="checkbox"]').prop('checked', checked);
        if (checked) {
            $('.actions--container').show();
        } else {
            $('.actions--container').hide();
        }
    })

    .on('keyup', '.modules__search', e => {
        let value = e.target.value.toLowerCase(),
            valueRu = convertRu.fromEn(value);

        let $menu = $('.sidebar-menu');

        $menu.find('li a, li span').each((i, el) => {
            var $el = $(el),
                $container = $el.closest('li');

            if (
                $el.text().toLowerCase().indexOf(value) == -1 &&
                $el.text().toLowerCase().indexOf(valueRu) == -1
            ) {
                $container.hide();
            } else {
                $container.show();
                $menu.show();
            }
        });

        $menu.each((i, el) => {
            let $el = $(el);
            if ($el.find('li:visible').length == 0) {
                $el.hide();
            }
        });
    })
    .on('keyup', '.table--toolbar .search input', e => {
        e.preventDefault();
        var searchVar = 'search';
        var $this = $(this);

        clearTimeout(updateTimer);
        let updateTimer = setTimeout(() => {
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
    .on('click', '.mmodal', e => {
        e.preventDefault();
        let $target = $(e.target).closest('a');
        return new Modal($target, {
            width: $target.data('width')
        });
    });

$(() => {
    $.mtooltip('[rel~=tooltip]');
    $('.select').selectize();
});