;(function($, undefined){

    var UPLOADER = 'uploader';
    var defaults = {};

    var formatSize = function(size) {
        var suff    = ['B', 'kB', 'MB', 'GB', 'PB'];
        var log     = parseInt(Math.log(size, 1024) / Math.log(1024), 10);
        return suff[log] ? (size / Math.pow(1024, log)).toFixed(2) + ' ' + suff[log] : size;
    };

    var hasHtml5 = function(){
        return 0;
        return (!!window.FormData && "upload" in new XMLHttpRequest) &&
            ('draggable' in document.createElement('span'));
    };

    var hasPaste = function(){
        if ($.browser.mozilla && parseFloat($.browser.version) > 21)
            return true;
        if ($.browser.webkit) {
            return (-1 != navigator.appVersion.indexOf('Chrome'));
        }
        return false;
    };

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

    var add_dndarea = function($wrapper)
    {
        var $dndarea  = $('<div class="droparea"/>').appendTo($wrapper);

        var stopEvt = function(e) {
            e.stopPropagation(); e.preventDefault();
        }

        $dndarea
            .bind('dragenter', stopEvt)
            .bind('dragover', stopEvt)
            .bind('drop', function(evt){
                var f = evt.originalEvent.dataTransfer.files;
                for(var i = 0; i < f.length; i++){
                    if (!f[i].size) continue; $dndarea.trigger('dropped', f[i]);
                }
                evt.preventDefault(); return false;
            });
        return $dndarea;
    };

    var get_file_icon = function(file) {
        var ext = $(file.name.split('.')).last().get(0).toLowerCase();
        if (('exts' in defaults) && ext in defaults.exts) {
            return defaults.base + defaults.exts[ext];
        }
        if ('mimes' in defaults && file.type in defaults.mimes) {
            return defaults.base + defaults.mimes[file.type];
        }

        if ('TYPE_DEFAULT' in defaults.types) {
            return defaults.base + defaults.types.TYPE_DEFAULT;
        }

        return false;
    };

    var add_filelist = function(uploader, $wrapper)
    {
        var list = $('<ul/>').appendTo($wrapper);

        list.delegate('li', 'click', function(){
            var idx = list.find('li').index(this);
            $(this).remove();
            list.trigger('delete', idx);
            return false;
        });

        list.bind('added', function(e, file){
            if (file instanceof File) {
                var li = $('<li/>').appendTo(list);
                li.append($('<span class="name"/>').html(file.name).attr('title', file.name));
                li.append($('<span class="size"/>').html(formatSize(file.size)));
                li.append($('<span class="icon"/>').css({
                    'background-image': 'url("'+get_file_icon(file)+'")'
                }));
            } else {
                var li = $('<li/>').appendTo(list);
                li.append($('<span class="name"/>').html('Pasted image'));
                li.append($('<span class="size"/>').html(formatSize(file.size)));
                li.append($('<span class="icon"/>'));

                var reader = new FileReader()
                reader.onload = function(){
                    li.find('.icon').append(
                        $('<img/>').attr('src', this.result)
                    );
                }
                reader.readAsDataURL(file);
            }
        });

        return list;
    };

    var add_paste_area = function($wrapper) {
        var pastearea = $('<div class="pastearea" contenteditable/>').appendTo($wrapper);

        pastearea.bind('paste', function (e) {

            var cb = e.originalEvent.clipboardData;

            if ('items' in cb) { //chrome/webkit
                e.preventDefault();
                var file = null;
                for (var i = 0; i < cb.items.length; i++) {
                    file = cb.items[i].getAsFile();
                    if (file) pastearea.trigger('pasted', file);
                }
                return;
            }

            if ('types' in cb && cb.types.length) { //safari/mac
                var file = cb.getData('image/png');
                if (file) {
                    pastearea.trigger('pasted', file);
                    return;
                }
            }

            // fallback
            setTimeout(function () {
                var img = pastearea.find('img').get(0);
                if (img) {
                    var src = img.src;
                    if (0 == img.src.indexOf('data:')) {
                        pastearea.trigger('pasted', dataURLtoBlob(src));
                    } else {
                        try {
                            var canvas = $('<canvas/>')
                                .attr('width', img.width)
                                .attr('height', img.height).get(0);
                            canvas.getContext("2d").drawImage(img, 0, 0);
                            pastearea.trigger('pasted', dataURLtoBlob(canvas.toDataURL()));
                            $(canvas).wrap('<div/>').html('');
                        } catch (e) {
                            throw e;
                        }
                    }
                }
                //pastearea.html('');
            }, 1);
        });

        return pastearea;
    };

    var add_multifile = function($el, name, $wrapper){
        $wrapper.delegate('.remove', 'click', function(){
            $(this).closest('.file').remove();
            $el.trigger('uploader.changed');
        });
        $el.clone().show()
            .attr('name', name).appendTo($wrapper)
            .wrap('<div class="file"/>');
        $('<a class="add">Add another</a>')
            .appendTo($wrapper)
            .bind('click', function(){
                var file = $el.clone().show()
                    .attr('name', name).insertBefore(this)
                    .wrap('<div class="file"/>');
                $('<a class="remove"/>')
                    .insertBefore(file);
                $el.trigger('uploader.changed');
            });
    };

    function Uploader($el) {
        var files       = [];
        var name        = $el.attr('name').replace('[]', '') + '[]';

        var $wrapper    = $('<div/>').addClass('formuploader').insertAfter($el);

        $el.removeAttr('name').val(null).hide();

        if (hasHtml5()) {

            $el.show().css({position: 'absolute', left: '-10000px'});

            var $dndarea    = add_dndarea($wrapper);
            var $filelist   = add_filelist(files, $dndarea);

            $dndarea.bind('dropped', function(e, file){
                files.push(file); $filelist.trigger('added', file);
                $el.trigger('uploader.changed');
            }).bind('click', function(){
                $el.click();
            });

            $el.bind('change', function(){
                for (var i = 0; i < this.files.length; i++) {
                    files.push(this.files[i]);
                    $filelist.trigger('added', this.files[i]);
                    $el.trigger('uploader.changed');
                }
                this.value = null;
            });

            $filelist.bind('delete', function(e, idx) {
                files.splice(idx, 1);
                $el.trigger('uploader.changed');
            });

            if (hasPaste()) {
                $dndarea.addClass('with-pastearea');
                var $paste = add_paste_area($wrapper).bind('pasted', function(e, blob){
                    if (blob && 'size' in blob && blob.size) {
                        files.push(blob);
                        $filelist.trigger('added', blob);
                        $el.trigger('uploader.changed');
                    }
                });
            }

        } else { add_multifile($el, name, $wrapper); }

        return {
            hasHtml5: hasHtml5,
            hasPaste: hasPaste,
            getName: function() { return name; },
            appendToFormData: function(formData){
                if (!formData) return;
                for (var i = 0; i < files.length; i++)
                    formData.append(name, files[i]);
            }
        }
    }

    $.fn.uploader = function() {
        $(this).each(function(idx, el){
            var $el = $(el);
            if (!$el.data(UPLOADER))
                $el.data(UPLOADER, new Uploader($el));
        });
        return $(this).eq(0).data(UPLOADER);
    };

    $.fn.uploader.defaults = function(config){
        return defaults = $.extend(defaults, config);
    }

    $.fn.uploader.hasHtml5 = hasHtml5;
    $.fn.uploader.hasPaste = hasPaste;

})(jQuery);