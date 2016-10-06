import $ from 'jquery';

class JsonTable {
    data = [];
    labels = {};

    constructor(data = [], labels = {}) {
        this.labels = labels;
        this.data = data instanceof Array ? data : [data];

        this._table_ = document.createElement('table');
        this._tr_ = document.createElement('tr');
        this._th_ = document.createElement('th');
        this._td_ = document.createElement('td');
    }

    // Adds a header row to the table and returns the set of columns.
    // Need to do union of keys from all records as some records may not contain
    // all records
    addAllColumnHeaders(table) {
        let columnSet = [],
            tr = this._tr_.cloneNode(false);

        for (let i = 0, l = this.data.length; i < l; i++) {
            for (let key in this.data[i]) {
                if (this.data[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                    columnSet.push(key);
                    let th = this._th_.cloneNode(false);
                    var label = typeof this.labels[key] != 'undefined' ? this.labels[key] : key;
                    th.appendChild(document.createTextNode(label));
                    tr.appendChild(th);
                }
            }
        }
        table.appendChild(tr);
        return columnSet;
    }

    // Builds the HTML Table out of myList json data from Ivy restful service.
    render() {
        let table = this._table_.cloneNode(false),
            columns = this.addAllColumnHeaders(table);

        for (let i = 0, maxi = this.data.length; i < maxi; ++i) {
            let tr = this._tr_.cloneNode(false);

            for (let j = 0, maxj = columns.length; j < maxj; ++j) {
                let td = this._td_.cloneNode(false);
                td.appendChild(document.createTextNode(this.data[i][columns[j]] || ''));
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        return table;
    }
}

module.exports = JsonTable;