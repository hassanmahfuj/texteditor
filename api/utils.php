<?php

define("ALLOWED_EXTENSIONS", ["json", "txt"]);

function get_safe_path($filename)
{
    // Reject empty filenames
    if (empty($filename)) {
        return false;
    }

    // Reject null bytes
    if (strpos($filename, "\0") !== false) {
        return false;
    }

    // Reject path separators — no subdirectories allowed
    if (strpos($filename, "/") !== false || strpos($filename, "\\") !== false) {
        return false;
    }

    // Strip any path components as a safety net
    $safe_filename = basename($filename);

    // Reject filenames with no extension
    $ext = strtolower(pathinfo($safe_filename, PATHINFO_EXTENSION));
    if ($ext === "") {
        return false;
    }

    // Validate extension (whitelist approach)
    if (!in_array($ext, ALLOWED_EXTENSIONS, true)) {
        return false;
    }

    // Ensure the resolved base directory exists
    $base_dir = realpath(__DIR__ . "/../files");
    if (!$base_dir) {
        mkdir(__DIR__ . "/../files", 0755, true);
        $base_dir = realpath(__DIR__ . "/../files");
    }

    $filepath = $base_dir . DIRECTORY_SEPARATOR . $safe_filename;

    // Defense-in-depth: verify realpath matches for existing files
    // (catches symlink attacks and race conditions on existing files)
    if (file_exists($filepath)) {
        $real_filepath = realpath($filepath);
        if ($real_filepath === false || $real_filepath !== $filepath) {
            return false;
        }
        return $real_filepath;
    }

    return $filepath;
}

function send_json($data, $status = 200)
{
    header("Content-Type: application/json");
    http_response_code($status);
    echo json_encode($data);
    exit();
}
