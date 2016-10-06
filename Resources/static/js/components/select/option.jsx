/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React, { Component, PropTypes } from 'react';

export default class Option extends Component {
    static propTypes = {
        onClick: PropTypes.func,
        onMouseOver: PropTypes.func,
        item: PropTypes.object.isRequired,
        disabled: PropTypes.bool.isRequired,
        labelKey: PropTypes.string.isRequired
    };

    static defaultProps = {
        className: "option-item",
        labelKey: "label"
    };

    render() {
        const { disabled, labelKey, className, onClick, onMouseOver, item, isFocused } = this.props;
        let cls = className;
        if (isFocused) {
            cls += " active";
        }
        if (disabled) {
            cls += " disabled";
        }
        return <div
            onClick={onClick}
            onMouseOver={onMouseOver}
            className={cls}>{item[labelKey]}</div>;
    }
}