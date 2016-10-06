/**
 * User: Falaleev Maxim (max@studio107.ru)
 * Date: 06/04/16
 * Time: 13:08
 */

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import CurrentValue from './current_value';
import Option from './option';

export default class Select extends Component {
    _timer = null;

    static propTypes = {
        options: PropTypes.array,
        defaultValue: PropTypes.any,
        value: PropTypes.any,
        valueKey: PropTypes.string,
        labelKey: PropTypes.string,
        onChangeInterval: PropTypes.number,
        minFilterLength: PropTypes.number,
        clearable: PropTypes.bool,
        ignoreCase: PropTypes.bool,
        isLoading: PropTypes.bool,
        enableSearch: PropTypes.bool,
        isAsync: PropTypes.bool,
        noResults: PropTypes.string,
        noResultsAsync: PropTypes.string,
        minFilterText: PropTypes.string,
        placeholder: PropTypes.string,
        loadingText: PropTypes.string,
        onChange: PropTypes.func,
        onInputChange: PropTypes.func,
        preloadSingleOption: PropTypes.func,
        currentValueComponent: PropTypes.func,
        optionComponent: PropTypes.func
    };

    static defaultProps = {
        options: [],
        isAsync: false,
        enableSearch: true,
        minFilterLength: 3,
        onChangeInterval: 350,
        preloadSingleOption: undefined,
        onChange: undefined,
        onInputChange: undefined,
        optionComponent: Option,
        currentValueComponent: CurrentValue,
        isLoading: false,
        clearable: true,
        minFilterText: 'Минимум символов для поиска:',
        placeholder: 'Выбор...',
        loadingText: 'Поиск...',
        noResults: 'Результаты отсутствуют',
        noResultsAsync: 'Результаты отсутствуют. Введите текст для поиска...',
        valueKey: 'value',
        labelKey: 'label',
        ignoreCase: true,
        defaultValue: undefined,
        value: undefined
    };

    state = {
        stateMessage: undefined,
        isLoading: false,
        options: [],
        focusedOption: {},
        currentOption: {},
        isOpen: false
    };

    preloadSingleOption(value) {
        this.setState({
            isLoading: true
        }, () => {
            let promise = this.props.preloadSingleOption(value);
            if (typeof promise === 'object') {
                promise.then(option => {
                    this.setState({
                        currentOption: option || {},
                        isLoading: false
                    });
                });
            } else {
                this.setState({
                    isLoading: false
                });
            }
        });
    }

    componentWillMount() {
        const { isAsync, preloadSingleOption }  = this.props;
        let value = this.props.value || this.props.defaultValue;
        if (value && isAsync && preloadSingleOption) {
            this.preloadSingleOption(value);
        }

        this._closeMenuIfClickedOutside = (e) => {
            if (!this.state.isOpen) {
                return;
            }
            let menuElem = ReactDOM.findDOMNode(this.refs.selectMenuContainer);
            let controlElem = ReactDOM.findDOMNode(this.refs.control);

            let eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, e);
            let eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, e);

            // Hide dropdown menu if click occurred outside of menu
            if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
                this.setState({
                    isOpen: false,
                    focusedOption: {}
                }, this._unbindCloseMenuIfClickedOutside.bind(this));
            }
        };

        this._bindCloseMenuIfClickedOutside = () => {
            if (!document.addEventListener && document.attachEvent) {
                document.attachEvent('onclick', this._closeMenuIfClickedOutside.bind(this));
            } else {
                document.addEventListener('click', this._closeMenuIfClickedOutside.bind(this));
            }

            if (this.refs.searchInput) {
                this.refs.searchInput.focus();
            }
        };
        this._unbindCloseMenuIfClickedOutside = () => {
            if (!document.removeEventListener && document.detachEvent) {
                document.detachEvent('onclick', this._closeMenuIfClickedOutside.bind(this));
            } else {
                document.removeEventListener('click', this._closeMenuIfClickedOutside.bind(this));
            }
        };

        let currentOption = {};
        if (value) {
            currentOption = this.findOptionByValue(value, this.props.options);
        }

        this.setState({
            currentOption,
            options: this.props.options
        });
    }

    componentWillReceiveProps(nextProps) {
        const { options } = nextProps;
        if (JSON.stringify(options) !== JSON.stringify(this.props.options)) {
            let value = nextProps.value || nextProps.defaultValue,
                currentOption = this.findOptionByValue(value, options);
            this.setState({
                options,
                currentOption
            });
        }
    }

    findOptionByValue(value, options) {
        options = options || this.props.options;
        for (let key in options) {
            if (options[key].value == value) {
                return options[key];
            }
        }

        return {};
    }

    clickedOutsideElement(element, e) {
        let eventTarget = (e.target) ? e.target : e.srcElement;
        while (eventTarget != null) {
            if (eventTarget === element) {
                return false;
            }
            eventTarget = eventTarget.offsetParent;
        }
        return true;
    }

    handleKeyDown(e) {
        if (this.props.disabled) {
            return;
        }
        switch (e.keyCode) {
            case 8: // backspace
                if (!this.state.inputValue && this.props.backspaceRemoves) {
                    e.preventDefault();
                    this.popValue();
                }
                return;
            case 9: // tab
                if (e.shiftKey || !this.state.isOpen || !this.state.focusedOption) {
                    return;
                }
                this.selectFocusedOption();
                break;
            case 13: // enter
                if (!this.state.isOpen) {
                    return;
                }
                this.selectFocusedOption();
                break;
            case 27: // escape
                if (this.state.isOpen) {
                    this.setState({
                        isOpen: false
                    }, this._unbindCloseMenuIfClickedOutside.bind(this));
                }
                break;
            case 38: // up
                this.focusPreviousOption();
                break;
            case 40: // down
                this.focusNextOption();
                break;
            default:
                return;
        }
        e.preventDefault();
    }

    focusNextOption() {
        this.focusAdjacentOption('next');
    }

    focusPreviousOption() {
        this.focusAdjacentOption('previous');
    }

    focusAdjacentOption(dir) {
        let ops = this.state.options.filter(op => !op.disabled);
        if (!ops.length) {
            return;
        }
        if (!this.state.isOpen) {
            this.setState({
                isOpen: true,
                focusedOption: this.state.focusedOption || ops[dir === 'next' ? 0 : ops.length - 1]
            }, this._bindCloseMenuIfClickedOutside.bind(this));
            return;
        }
        let focusedIndex = -1;
        for (let i = 0; i < ops.length; i++) {
            if (this.state.focusedOption === ops[i]) {
                focusedIndex = i;
                break;
            }
        }
        let focusedOption = ops[0];
        if (dir === 'next' && focusedIndex > -1 && focusedIndex < ops.length - 1) {
            focusedOption = ops[focusedIndex + 1];
        } else if (dir === 'previous') {
            if (focusedIndex > 0) {
                focusedOption = ops[focusedIndex - 1];
            } else {
                focusedOption = ops[ops.length - 1];
            }
        }
        this.setState({
            focusedOption
        });
    }

    handleOnClickWrapper(e) {
        if (!this.state.isOpen && !this.isLoading()) {
            this.setState({
                isOpen: true
            }, this._bindCloseMenuIfClickedOutside.bind(this));
        }
    }

    render() {
        let currentValue = React.createElement(this.props.currentValueComponent, {
            item: this.state.currentOption,
            placeholder: this.props.placeholder
        });
        return (
            <div ref="control"
                 tabIndex="1"
                 onKeyDown={this.handleKeyDown.bind(this)}
                 className="select-container">
                <input type="hidden" value={this.state.currentOption.value} name={this.props.name}/>

                <div className="select-input"
                     tabIndex="-1"
                     onClick={this.handleOnClickWrapper.bind(this)}>
                    {this.renderClear()}
                    {currentValue}
                </div>
                <div ref="selectMenuContainer"
                     className={"select-options-container" + (this.state.isOpen ? "" : " hide")}>
                    <div className="select-options-list" onKeyDown={this.handleKeyDown.bind(this)}>
                        {this.renderSearchInput()}
                        <div className="select-options-wrapper">
                            {this.renderMenu()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    filterOptions(value) {
        const { options } = this.props;
        return options.filter(op => {
            let valueTest = String(op[this.props.valueKey]);
            let labelTest = String(op[this.props.labelKey]);
            if (this.props.ignoreCase) {
                valueTest = valueTest.toLowerCase();
                labelTest = labelTest.toLowerCase();
                value = value.toLowerCase();
            }
            if (!value || (this.props.matchPos === 'start')) {
                return (
                        this.props.matchProp !== 'label' &&
                        valueTest.substr(0, value.length) === value
                    ) || (
                        this.props.matchProp !== 'value' &&
                        labelTest.substr(0, value.length) === value
                    );
            } else {
                return (
                        this.props.matchProp !== 'label' &&
                        valueTest.indexOf(value) >= 0
                    ) || (
                        this.props.matchProp !== 'value' &&
                        labelTest.indexOf(value) >= 0
                    );
            }
        });
    }

    isLoading() {
        return this.state.isLoading || this.props.isLoading;
    }

    handleFilterOptions(e) {
        let value = e.target.value;

        const { isAsync, onInputChange, onChangeInterval, minFilterLength, minFilterText } = this.props;
        if (isAsync && onInputChange) {
            clearTimeout(this._timer);

            if (value.length < minFilterLength) {
                this.setState({
                    stateMessage: minFilterText + ' ' + minFilterLength,
                    options: [],
                    isLoading: false
                });
            } else {
                this._timer = setTimeout(() => {
                    this.setState({
                        stateMessage: undefined,
                        isLoading: true
                    }, () => {
                        let promise = onInputChange(value);
                        if (typeof promise === "object") {
                            promise.then(options => {
                                this.setState({
                                    options,
                                    isLoading: false
                                });
                            });
                        } else {
                            this.setState({
                                options: [],
                                isLoading: false
                            });
                        }
                    });
                }, onChangeInterval);
            }
        } else {
            this.setState({
                options: this.filterOptions(e.target.value)
            });
        }
    }

    clearValue(e) {
        this.setState({
            currentOption: {}
        }, this.fireChangeEvent.bind(this));
    }

    renderClear() {
        const { clearable, clearValueText, disabled } = this.props;
        const { currentOption } = this.state;
        if (disabled || this.isLoading() || !clearable || !currentOption.value) {
            return null;
        }

        return (
            <span
                className="select-clear-zone"
                title={clearValueText}
                aria-label={clearValueText}
                onMouseDown={this.clearValue.bind(this)}
                onClick={this.clearValue.bind(this)}
                onClick={this.clearValue.bind(this)}>
                <span className="select-clear">&times;</span>
            </span>
        );
    }

    renderSearchInput() {
        const { enableSearch, options, isAsync } = this.props;

        if (enableSearch === false || isAsync === false && options.length === 0) {
            return null;
        }

        return (
            <div className="search-input">
                <input
                    ref="searchInput"
                    type="text"
                    placeholder="Поиск..."
                    onChange={this.handleFilterOptions.bind(this)}/>
            </div>
        )
    }

    renderOption(item, index) {
        const { valueKey, labelKey } = this.props;
        return React.createElement(this.props.optionComponent, {
            labelKey: labelKey,
            onClick: !item.disabled ? this.selectOption.bind(this, item) : null,
            onMouseOver: !item.disabled ? this.focusOption.bind(this, item) : null,
            key: index,
            isFocused: this.state.focusedOption[valueKey] == item[valueKey],
            item: item,
            disabled: Boolean(item.disabled)
        })
    }

    renderMenu() {
        const { isAsync, noResults, noResultsAsync, loadingText } = this.props;
        const { stateMessage, options } = this.state;

        if (this.isLoading()) {
            return <div className="loading">{loadingText}</div>
        } else if (options.length > 0) {
            return this.renderOptions();
        } else if (stateMessage) {
            return <div className="no-results">{stateMessage}</div>;
        } else if (isAsync && options.length == 0) {
            return <div className="no-results">{noResultsAsync}</div>;
        } else {
            return <div className="no-results">{noResults}</div>;
        }
    }

    renderOptions() {
        return this.state.options.map((item, index) => this.renderOption(item, index));
    }

    focusOption(focusedOption) {
        this.setState({focusedOption});
    }

    selectOption(currentOption) {
        const { isAsync, options, valueKey } = this.props;
        this.setState({
            currentOption,
            isOpen: false
        }, () => {
            this._unbindCloseMenuIfClickedOutside();
            this.fireChangeEvent(currentOption[valueKey], isAsync ? this.state.options : options);
        });
    }

    selectFocusedOption() {
        if (this.state.focusedOption) {
            this.selectOption(this.state.focusedOption);
        }
    }

    fireChangeEvent(value, options) {
        if (this.props.onChange) {
            this.props.onChange(value || '', options);
        }
    }
}