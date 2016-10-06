import $ from 'jquery';
import { cookie } from 'easy-storage';

// these HTTP methods do not require CSRF protection
let isSafeMethod = method => (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));

$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: (xhr, settings) => {
        if (isSafeMethod(settings.type) == false) {
            xhr.setRequestHeader("X-CSRFToken", cookie.get('X-CSRFToken'));
        }
    }
});
