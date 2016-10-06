/**
 * @author Falaleev Maxim <max@studio107.ru>
 *
 * Simple usage:
 * $.mmodal('<h1>Hello!</h1>'); or $("a.mmodal").mmodal();
 * or
 * $("a.mmodal").on('click', function(e) {
     *      $.mmodal('<h1>Hello!</h1>');
     *      e.preventDefault();
     *      return false;
     * });
 * or
 * $('a#inline').mmodal()
 * <div id="inline" class="mmodal-modal">
 *     <h2>Beautiful!</h2>
 * </div>
 */

;(function () {
    'use strict';

    var $ = require('jquery');

    let noop = () => {};

    class Modal {
        version = "1.2";
        locked = true;
        $element = undefined;
        $content = undefined;
        $bg = undefined;
        $container = undefined;

        inline = false;
        inlineIndex = undefined;
        $inlineParent = undefined;

        classes = {
            content: 'mmodal-content',
            container: 'mmodal-container',
            animation: 'animated',
            background: 'mmodal-modal-bg',
            closeButton: 'mmodal-close',
            bodyClass: 'mmodal-opened'
        };

        constructor(element, options) {
            var defaultOptions = {
                ajax: {
                    type: "GET",
                    dataType: null
                },
                animation: false,
                animationdelay: 1.3,
                skin: 'default',
                width: undefined,
                closeonclick: true,
                closeonescape: true,

                autoclose: false,
                autoclosedelay: 1450,

                onBeforeStart: noop,
                onSuccess: noop,
                onBeforeOpen: noop,
                onAfterOpen: noop,
                onBeforeClose: noop,
                onAfterClose: noop,
                onSubmit: 'default'
            };
            this.locked = true;

            this.$element = element instanceof Object ? element : $(element);

            this.options = {...defaultOptions, ...options};

            if (this.$element.is("a")) {
                this._prepareLink();
            } else {
                this.start(this.$element.clone());
            }
            return this;
        }

        getContainer() {
            return this.$container == undefined ? this.renderContainer() : this.$container;
        }

        setContent($html) {
            var $content = this.$content;

            $content.html($html);
            if ($content.find('form').length > 0) {
                var self = this;
                $content.find("[type='submit']").off("click").on("click", function (e) {
                    e.preventDefault();
                    self._submitHandler.call(self, this);
                    return false;
                });
                $content.find("form").off("submit").on("submit", function (e) {
                    e.preventDefault();
                    self._submitHandler.call(self, this);
                    return false;
                });
            }
        }

        renderContainer() {
            this.$content = $('<div />')
                .addClass(this.classes.content);

            this.$close = $('<a href="#">&times;</a>')
                .addClass(this.classes.closeButton);

            this.$container = $('<div />')
                .addClass(this.classes.container + ' ' + this.options.skin);

            if (this.options.animation) {
                this.$container.addClass(this.classes.animation + ' ' + this.options.animation + 'In');
            }

            this.$container.append(this.$close)
                .append(this.$content);

            this.$bg = $("<div />")
                .addClass(this.classes.background + ' ' + this.options.skin)
                .append(this.$container)
                .appendTo('body');

            return this.$container;
        }

        _prepareLink() {
            var self = this,
                href = this.$element.attr('href'),
                $html;

            if (href.match(/^#/)) {
                var $targetContainer = $(href);
                // Get container and inner html content
                $html = $targetContainer[0];

                this.$inlineParent = $targetContainer.parent();
                this.inlineIndex = $targetContainer.index();
                this.inline = true;

                $targetContainer.detach();
                this.start($html);
            } else {
                $.ajax({
                    dataType: this.options.ajax.dataType,
                    type: this.options.ajax.type,
                    url: href,
                    cache: false,
                    success(data, textStatus, jqXHR) {
                        if (self.options.ajax.dataType == 'json') {
                            $html = data.content;
                        } else {
                            $html = data;
                        }
                        self.start.call(self, $html);
                    },
                    error(jqXHR, textStatus, errorThrown) {
                        self.start.call(self, jqXHR.responseText);
                    }
                });
            }
        }

        _submitHandler(element) {
            if (typeof this.options.onSubmit == 'function') {
                this.options.onSubmit.call(this, element);
            } else {
                this._submitHandlerDefault.call(this, element);
            }
        }

        _submitHandlerDefault(element) {
            var self = this,
                content = '',
                options = this.options,
                $data = {},
                $form = $(element),
                $context = $($form.context);

            if ($context.is('[type="submit"]')) {
                $data[$context.attr('name')] = $context.val();
                $form = $context.closest('form');
            }

            $.ajax({
                url: $form.attr('action'),
                type: 'post',
                data: $form.serialize(),
                success: (data, textStatus, jqXHR) => {
                    if (
                        // If possible
                        jqXHR.status == 301 ||
                        jqXHR.status == 302 ||
                        // If connected AjaxRedirectMiddleware
                        jqXHR.status == 278
                    ) {
                        window.location = jqXHR.getResponseHeader('location');
                    }

                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                    }

                    options.onSuccess.call(this, data, textStatus, jqXHR);
                    if (data.close) {
                        return self.close();
                    }
                    if (data) {
                        content = data['content'] || data['title'] || data;
                        self.setContent(content);
                    }

                    if (!data) {
                        self.close();
                    } else if (data.status === 'success' && options.autoclose) {
                        setTimeout(function () {
                            return self.close();
                        }, options.autoclosedelay);
                    }
                }
            });
        }

        start(html) {
            this.options.onBeforeStart();
            this.renderContainer();
            this.setContent(html);
            this.bindEvents();
            this.open();
        }

        open() {
            var $body = $('body'),
                before = $body.outerWidth();

            this.options.onBeforeOpen();

            this.$bg.show();
            this.$container.css('width', this.options.width || this.$container.width()).show();

            $body.css({
                'overflow': 'hidden',
                'padding-right': $body.outerWidth() - before
            }).addClass(this.classes.bodyClass);

            this.options.onAfterOpen();
        }

        close() {
            this.options.onBeforeClose();

            $('body').off('keyup').css({
                'overflow': '',
                'padding-right': ''
            }).removeClass(this.classes.bodyClass);

            this.$close.off('click');
            this.$bg.off('click');

            if (this.inline) {
                var href = this.$element.attr('href');
                var $target = this.$inlineParent.children(":eq(" + this.inlineIndex + ")");
                var $originalContent = this.$content.children();
                if ($target > -1) {
                    $target.prepend($originalContent);
                } else {
                    this.$inlineParent.append($originalContent);
                }
            }

            if (this.options.animation) {
                this.$container.addClass(this.classes.animation + ' ' + this.options.animation + 'Out');

                var self = this;
                setTimeout(function () {
                    self.$bg.remove();
                }, this.options.animationdelay * 1000);
            } else {
                this.$bg.remove();
            }

            this.options.onAfterClose();
        }

        bindEvents() {
            var self = this, options = this.options;

            this.$close.on('click', function (e) {
                e.preventDefault();
                self.close();
                return false;
            });

            if (options.closeonclick == true) {
                this.$bg.addClass('clickable');
                this.$bg
                    .on('click', function (e) {
                        if (e.target === this) {
                            e.preventDefault();
                            self.close();
                            return false;
                        }
                    });
            }

            this.$bg
                .on('mousewheel', function (e) {
                    var $this = $(this);
                    $this.scrollTop($this.scrollTop() - e.originalEvent.wheelDeltaY);
                    return false;
                })

                .on("touchstart", function (e) {
                    this.touches = {
                        'startingY': e.originalEvent.touches[0].pageY,
                        'startingX': e.originalEvent.touches[0].pageX,
                    };
                })


                .on('touchmove', function (e) {
                    var $this = $(this),
                        $window = $(window);

                    var deltaY = e.originalEvent.touches[0].pageY - this.touches.startingY;
                    var deltaX = e.originalEvent.touches[0].pageX - this.touches.startingX;

                    $this.scrollTop($this.scrollTop() - deltaY);
                    $this.scrollLeft($this.scrollLeft() - deltaX);

                    this.touches.startingY = e.originalEvent.touches[0].pageY;
                    this.touches.startingX = e.originalEvent.touches[0].pageX;

                    return false;
                });

            if (options.closeonescape == true) {
                $('body').on('keyup', function (e) {
                    if (e.which === 27) {
                        self.close();
                    }
                });
            }
        }
    }

    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function () {
            return Modal;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports.Modal = Modal;
    } else {
        window.Modal = Modal;
    }
}());