<?php
require_once "utils.php";

$files_dir = realpath(__DIR__ . "/../files");
if (!$files_dir) {
    mkdir(__DIR__ . "/../files", 0755, true);
    $files_dir = realpath(__DIR__ . "/../files");
}

$files = array_values(
    array_filter(scandir($files_dir), function ($file) use ($files_dir) {
        return !is_dir($files_dir . DIRECTORY_SEPARATOR . $file) &&
            $file !== "." &&
            $file !== ".." &&
            $file !== ".htaccess";
    }),
);

send_json($files);
