(function($, undefined){
    $(function(){
        var $results = $('#results'),
            $form = $('form');

        var success = function(json) { $results.html(json); };
        var uploader = $form.find('input[type="file"]').uploader();

        $form.bind('submit', function(e){
            e.preventDefault();
            if ($.fn.uploader.hasHtml5()) {
                var formAction = $form.attr('action') || location.href;
                var formData = new FormData($form.get(0));
                uploader.appendToFormData(formData);
                var xhr = new XMLHttpRequest();
                xhr.open($form.attr('method') || 'POST', formAction, true);
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.onreadystatechange = function(evt) {
                    if(this.readyState == this.DONE) {
                        if (this.status == 200)
                            success(this.responseText);
                    }
                };
                xhr.send(formData);
            } else $form.ajaxSubmit({
                success: success
            });
            return false;
        });

        $.fn.uploader.defaults({
            "base": "img/64-",
            "types": { TYPE_DEFAULT: "default.png" },
            "mimes": {
                "application/octet-stream": "default.png",
                "image/png": "default.png",
                "image/jpg": "default.png",
                "image/jpeg": "default.png",
                "image/gif": "default.png",
                "image/bmp": "default.png",
                "audio/mpeg": "default.png",
                "text/plain": "default.png",
                "text/html": "default.png",
                "application/pdf": "default.png",
                "application/x-gzip": "default.png",
                "application/zip": "default.png",
                "application/rar": "default.png",
                "application/x-rar": "default.png",
                "application/msword": "default.png",
                "application/vnd.ms-excel": "default.png",
                "application/vnd.ms-office": "default.png",
                "application/msword; charset=binary": "default.png",
                "application/vnd.ms-word.document.macroEnabled.12": "default.png",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "default.png",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.template": "default.png",
                "application/vnd.ms-powerpoint.template.macroEnabled.12": "default.png",
                "application/vnd.openxmlformats-officedocument.presentationml.template": "default.png",
                "application/vnd.ms-powerpoint.addin.macroEnabled.12": "default.png",
                "application/vnd.ms-powerpoint.slideshow.macroEnabled.12": "default.png",
                "application/vnd.openxmlformats-officedocument.presentationml.slideshow": "default.png",
                "application/vnd.ms-powerpoint.presentation.macroEnabled.12": "default.png",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation": "default.png",
                "application/vnd.ms-excel.addin.macroEnabled.12": "default.png",
                "application/vnd.ms-excel.sheet.binary.macroEnabled.12": "default.png",
                "application/vnd.ms-excel.sheet.macroEnabled.12": "default.png",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "default.png",
                "application/vnd.ms-excel.template.macroEnabled.12": "default.png",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.template": "default.png"
            }, "exts": {
                "ppt": "default.png",
                "pptx": "default.png",
                "doc": "default.png",
                "docx": "default.png",
                "css": "default.png"
            }
        });


    });
})(jQuery);
