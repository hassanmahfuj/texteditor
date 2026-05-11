<?php
require_once "utils.php";

$templates_dir = realpath(__DIR__ . "/../templates");
if (!$templates_dir) {
    mkdir(__DIR__ . "/../templates", 0755, true);
    $templates_dir = realpath(__DIR__ . "/../templates");
}

$templates = array_values(
    array_filter(scandir($templates_dir), function ($file) use (
        $templates_dir,
    ) {
        return !is_dir($templates_dir . DIRECTORY_SEPARATOR . $file) &&
            $file !== "." &&
            $file !== ".." &&
            $file !== ".htaccess";
    }),
);

send_json($templates);
