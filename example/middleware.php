<?php

if(isset($_FILES)) {
    $fix_blob_names_middleware = function(&$file) {

        static $time;
        static $count;

        if (null === $time) $time = time();
        if (null === $count) $count = 1;

        $make_blob_filename = function($originalName, $type) use($time, &$count) {
            if (!$originalName || $originalName == 'blob') {
                $ext = 'blob';

                switch($type) {
                    case 'image/png':       $ext = 'png'; break;
                    case 'image/gif':       $ext = 'gif'; break;
                    case 'image/jpeg':      $ext = 'jpg'; break;
                    case 'image/jpg':       $ext = 'jpg'; break;
                }

                return sprintf('blob_%d_%d.%s', $time, $count++, $ext);
            }
            return $originalName;
        };

        if (is_array($file['name'])) {
            foreach($file['name'] as $idx => $name) {
                if ($file['error'][$idx]) continue;
                $file['name'][$idx] = $make_blob_filename($name, $file['type'][$idx]);
            }
        } else if (!$file['error']) {
            $file['name'] = $make_blob_filename($file['name'], $file['type']);
        }
    };

    foreach($_FILES as &$file) {
        $fix_blob_names_middleware($file);
    }
}