import fetch from 'axios';
import Qs from 'query-string';
import urlJoin from 'url-join';
import { cookie } from 'easy-storage';

const defaultHeaders = {
    "Accept": 'application/json'
};

const settings = {
    VERBOSE: true
};

export default {
    _wrap(url, method, params = {}, data = {}, headers = defaultHeaders) {
        let isGet = /^(GET|HEAD|OPTIONS|TRACE)$/.test(method.toUpperCase());

        if (typeof data !== 'string') {
            data = Qs.stringify(data);
        }

        if (!isGet) {
            headers = {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                ...headers,
                "X-CSRFToken": cookie.get('X-CSRFToken')
            }
        }

        let config = {url, params, data, method, headers};

        return fetch(config)
            .then(response => {
                if (settings.VERBOSE) {
                    console.group('fetch ' + url);
                    console.log('%cQuery', 'color: #b6d655', params);
                    console.log('%cBody', 'color: #b6d655', data);
                    console.log('%cResponse', 'color: #55b6d6', response);
                    console.groupEnd();
                }
                return response.data;
            })
            .catch(response => {
                if (settings.VERBOSE) {
                    console.groupEnd();
                    console.group('fetch error ' + url);
                    console.log('%cData', 'color: #b6d655', data);
                    if (response instanceof Error) {
                        // Something happened in setting up the request that triggered an Error
                        console.log('%cError', 'color: #a00', response.message);
                    } else {
                        if (response.status == 403) {
                            window.location = '/auth/login';
                        } else {
                            // The request was made, but the server responded with a status code
                            // that falls out of the range of 2xx
                            console.log('%cError', 'color: #a00', response);
                        }
                    }
                    console.groupEnd();
                }
            });
    },

    get(url, data = {}, params = {}) {
        return this._wrap(url, 'GET', data, params);
    },

    patch(url, data = {}, params = {}) {
        return this._wrap(url, 'PATCH', data, params);
    },

    put(url, data = {}, params = {}) {
        return this._wrap(url, 'PUT', data, params);
    },

    delete(url, data = {}, params = {}) {
        return this._wrap(url, 'DELETE', data, params);
    },

    post(url, data = {}, params = {}) {
        return this._wrap(url, 'POST', data, params);
    }
}