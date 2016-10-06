import React, { Component, PropTypes } from 'react';

export default class Product extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
        vendor_code: PropTypes.string.isRequired,
        total: PropTypes.string,
        count: PropTypes.string,
        onChange: PropTypes.func.isRequired
    };

    state = {
        total: 0,
        count: 1,
        removed: false
    };

    componentWillMount() {
        const { price, onChange, total, count } = this.props;
        this.setState({
            total: total || Number(price),
            count: count || 1
        }, () => {
            onChange();
        });
    }

    getTotal() {
        return Number(this.state.total);
    }

    getCount() {
        return Number(this.state.count);
    }

    handleChange(e) {
        let v = e.target.value;
        if (/^\d+$/.test(v) == false) {
            e.preventDefault();
            return false;
        }

        const { price, onChange } = this.props;

        let count = Number(v),
            total = Number(price) * count;

        this.setState({count, total}, onChange);
    }

    renderFields() {
        const { removed, total, count } = this.state;
        const { id } = this.props;
        return removed ? null : (
            <div>
                <input type="hidden" name={"OrderAdminForm[products][" + id + "][id]"} value={id}/>
                <input type="hidden" name={"OrderAdminForm[products][" + id + "][count]"} value={count}/>
                <input type="hidden" name={"OrderAdminForm[products][" + id + "][price]"} value={total}/>
            </div>
        );
    }

    handleRemove(e) {
        e.preventDefault();
        if (confirm('Вы действительно хотите удалить товар из заказа?')) {
            this.setState({
                removed: true
            });
        }
    }

    render() {
        const { total, count, removed } = this.state;
        const { id, name, price, vendor_code } = this.props;
        let style = {
            display: removed ? 'none' : 'table-row'
        };
        return (
            <tr style={style}>
                <td>
                    <p>{id} - {name}</p>
                    <p className="order-product-vendor-code">{vendor_code}</p>
                    {this.renderFields()}
                </td>
                <td>
                    {price}
                </td>
                <td>
                    <input type="number" ref="input" onChange={this.handleChange.bind(this)} value={count}/>
                </td>
                <td>{total}</td>
                <td>
                    <a href="#" onClick={this.handleRemove.bind(this)}>&times;</a>
                </td>
            </tr>
        );
    }
}