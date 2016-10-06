/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import OrderForm from './OrderForm';

$.fn.extend({
    order_form: function (options) {
        return this.each((i, el) => ReactDOM.render(<OrderForm {...options} />, el));
    }
});
