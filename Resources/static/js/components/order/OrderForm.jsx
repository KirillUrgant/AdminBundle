import React, { Component, PropTypes } from 'react';
import Select from '../select/select';
import fetch from '../fetch';
import _ from 'lodash';
import Product from './Product';

export default class OrderForm extends Component {
    static propTypes = {
        url: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        products: PropTypes.array
    };

    static defaultProps = {
        url: '',
        products: [],
        selectOptions: {
            valueKey: "id",
            labelKey: "name"
        }
    };

    state = {
        products: [],
        total: 0,
        count: 0
    };

    componentWillMount() {
        const { products } = this.props;
        this.setState({
            products
        });
    }

    handleSelectChange(id, objects) {
        let product = _.first(_.where(objects, {id})),
            has = _.where(this.state.products, {id});
        if (product && has.length == 0) {
            this.setState({
                products: [...this.state.products, product]
            });
        }
    }

    renderSelect() {
        const { url, selectOptions } = this.props;
        return (
            <div>
                <label htmlFor="order-select">Выбор товара</label>
                <Select
                    {...selectOptions}
                    id="order-select"
                    isAsync={true}
                    onInputChange={value => fetch.get(url, {value})}
                    onChange={this.handleSelectChange.bind(this)}/>
            </div>
        );
    }

    handleOnChangePrice() {
        const { onChange } = this.props;

        let total = 0,
            count = 0;
        for (let id in this.refs) {
            total += this.refs[id].getTotal();
            count += this.refs[id].getCount();
        }
        this.setState({total, count}, () => onChange(total));
    }

    renderProducts() {
        let { products, count, total } = this.state;
        if (products.length == 0) {
            return <span />;
        }

        let nodes = products.map((product, i) => {
            return <Product ref={i} key={i} onChange={this.handleOnChangePrice.bind(this)} {...product} />;
        });

        return (
            <div>
                <h3>Продукция</h3>
                <table className="order-product-table">
                    <thead>
                    <tr>
                        <th className="order-product-td-name">Товар</th>
                        <th className="order-product-td-price">Стоимость</th>
                        <th className="order-product-td-count">Количество</th>
                        <th className="order-product-td-total">Итог</th>
                        <th className="order-product-td-actions"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {nodes}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan="4">
                            <p>Товаров: {Number(count)} на сумму {Number(total)}</p>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        )
    }

    render() {
        return (
            <div className="order-product-container">
                {this.renderSelect()}
                {this.renderProducts()}
            </div>
        );
    }
}