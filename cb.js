(function ($) {
    'use strict';

    var MYKEY = 'screenshot',
        $document = $(document),
        $picker = null;

    $(function(){
        $picker = $('.cb_picker');
        if (!$picker.length) {
            $picker = $('<div class="cb_picker"><div class="bg"/><div class="area" contenteditable/></div>')
                .appendTo(document.body);
        }
    });

    /**
     * Taken from http://mitgux.com/send-canvas-to-server-as-file-using-ajax
     * adopted in order to detect dataUrl type
     * @param dataURL
     * @returns {Blob}
     */
    function dataURLtoBlob(dataURL) {
        var format_data = dataURL.split(',');
        var type_encoding = format_data[0].split(';');
        var binary = atob(format_data[1]);

        // Create 8-bit unsigned array
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        // Return our Blob object
        return new Blob([new Uint8Array(array)], {type: type_encoding[0].split(':')[1]});
    }

    $.fn.cb = function (callback) {
        $(this).each(function (idx, el) {

            el = $(el);

            if (el.data(MYKEY)) return;
            el.data(MYKEY, true);

            el.on('click', function () {

                var $area = $picker.addClass('active').find('.area');

                var cancel = function () {
                    $picker.removeClass('active');
                    $document.unbind('keypress', escapeListener);
                    $area.unbind('paste', pasteListener);
                };

                var pasteListener = function (e) {
                    var file = null;
                    var cb = e.originalEvent.clipboardData;

                    if ('items' in cb) {
                        e.preventDefault();
                        for (var i = 0; i < cb.items.length; i++) {
                            file = cb.items[i].getAsFile();
                            if (file)
                                callback(file);
                        }
                        cancel();
                    } else {
                        setTimeout(function () {
                            var img = $area.find('img').get(0);
                            if (img) {
                                var src = img.src;
                                if (0 == img.src.indexOf('data:')) {
                                    callback(dataURLtoBlob(src));
                                } else {
                                    try {
                                        var canvas = $('<canvas/>')
                                            .attr('width', img.width)
                                            .attr('height', img.height).get(0);
                                        canvas.getContext("2d").drawImage(img, 0, 0);
                                        callback(dataURLtoBlob(canvas.toDataURL()));
                                        $(canvas).wrap('<div/>').html('');
                                    } catch (e) {
                                    }
                                }
                            }
                            $area.html('');
                            cancel();
                        }, 1);
                    }
                };

                var escapeListener = function (e) {
                    if (e.keyCode == 27) cancel();
                };

                $document.bind('keypress', escapeListener);
                $area.bind('paste', pasteListener).focus()
            })
        });
    };

})(jQuery);