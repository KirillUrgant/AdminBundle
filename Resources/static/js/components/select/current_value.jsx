/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */
import React, { Component, PropTypes } from 'react';

export default class CurrentValue extends Component {
    static propTypes = {
        placeholder: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        item: PropTypes.object
    };

    render() {
        const { placeholder, item } = this.props;
        return item.value ? <span className="current-value">{item.label}</span> : <span className="placeholder">{String(placeholder)}</span>;
    }
}