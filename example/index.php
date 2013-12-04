<?php
    require_once 'middleware.php';
    if ('POST' == $_SERVER['REQUEST_METHOD']) {
       var_export(array(
           '_files' => $_FILES, '_request' => $_REQUEST
       ));
       return;
    }
?>
<!doctype html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="head/style.css">
        <link rel="stylesheet" type="text/css" href="../lib/uploader/uploader.css">
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
        <!-- formuploader fallback -->
        <script src="http://malsup.github.com/jquery.form.js"></script>
        <script src="../lib/uploader/uploader.js"></script>
        <script src="head/scripts.js"></script>
    </head>
<body>
    <form method="POST" action="" enctype="multipart/form-data">
        <div>
            <label for="fld1">fld1:</label>
            <input type="text" name="fld1" value="val2">
        </div>
        <div>
            <label for="fld2">fld1:</label>
            <input type="text" name="fld2" value="val2">
        </div>
        <div>
            <label for="files">files:</label>
            <input type="file" name="files[]" id="files" multiple>
        </div>
        <div>
            <button type="submit">Submit</button>
        </div>
    </form>
    <pre id="results"></pre>
</body>
</html>