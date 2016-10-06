//title, text, pictureSrc,
(function ($) {
    $.mnotify = function (textOptions, options) {
        var stackContainer, messageWrap, messageHeader, messageBox, messageBody, messageTextBox, closeButton, messagePicture, image;

        textOptions = $.extend({
            title: undefined,
            message: undefined,
            image: undefined
        }, textOptions);

        options = $.extend({
            lifetime: 3000,
            click: undefined
        }, options);

        // находим контейнер с сообщениями, если его нет, тогда создаём
        stackContainer = $('#notifier-box');
        if (!stackContainer.length) {
            stackContainer = $('<div>', {
                id: 'notifier-box'
            }).prependTo(document.body);
        }

        // создаём элементы вертски контейнера сообщения
        messageWrap = $('<div>').addClass('message-wrap').css('display', 'none');
        messageBox = $('<div>').addClass('message-box');

        messageHeader = $('<div>', {
            text: textOptions.title
        }).addClass('message-header');

        messageBody = $('<div>').addClass('message-body');

        messageTextBox = $('<span>');
        messageTextBox.append(textOptions.message);

        closeButton = $('<a>', {
            href: '#',
            title: 'Закрыть уведомление',
            click: function (event) {
                $(this).parent().parent().fadeOut(300, function () {
                    $(this).remove();
                });
                event.preventDefault();
                return false;
            }
        }).addClass('message-close');

        // если указан путь к картинке, тогда создадим контейнер и для неё :)
        if (textOptions.image != undefined) {
            messagePicture = $('<div>').addClass('thumb');
            image = $('<img>', {
                src: textOptions.image
            });
        }

        // теперь расположим все на свои места
        messageWrap.appendTo(stackContainer).fadeIn();
        messageBox.appendTo(messageWrap);
        closeButton.appendTo(messageBox);
        messageHeader.appendTo(messageBox);
        messageBody.appendTo(messageBox);

        if (messagePicture != undefined) {
            messagePicture.appendTo(messageBody);
            image.appendTo(messagePicture);
        }
        messageTextBox.appendTo(messageBody);

        // если время жизни уведомления больше 0, ставим таймер
        if (options.lifetime > 0) {
            setTimeout(function () {
                $(messageWrap).fadeOut(300, function () {
                    $(this).remove();
                });
            }, options.lifetime);
        }

        // если установлен колбек
        if (options.click != undefined) {
            messageWrap.click(function (e) {
                if (!jQuery(e.target).is('.message-close')) {
                    options.click.call(this);
                }
            });
        }

        return this;
    }
})(jQuery);