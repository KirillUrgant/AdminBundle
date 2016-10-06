/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Select from './select';

$.fn.extend({
    selectize: function (options) {
        let defaultOptions = {
            valueKey: 'value',
            labelKey: 'label'
        };

        let settings = {...defaultOptions, ...options};

        return this.each(function (i, el) {
            let $wrapper = $('<div></div>'),
                $el = $(el);
            $wrapper.insertAfter($el);

            let params = settings.options || [],
                defaultValue = null;
            if ($el.is('select') && params.length == 0) {
                $el.children('option').each(function (i, opt) {
                    if (opt.getAttribute('selected') == 'selected') {
                        defaultValue = opt.value;
                    }
                    if (opt.value && opt.text) {
                        params.push({
                            value: opt.value,
                            label: opt.text
                        });
                    }
                });
                $el.remove();
            }

            let newParams = {
                ...settings,
                defaultValue,
                options: settings.options || params,
                name: el.getAttribute('name')
            };
            ReactDOM.render(<Select {...newParams} />, $wrapper.get(0));
        });
    }
});
