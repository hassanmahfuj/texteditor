<?php
function get_safe_path($filename) {
    $base_dir = realpath(__DIR__ . '/../files');
    if (!$base_dir) {
        mkdir(__DIR__ . '/../files', 0777, true);
        $base_dir = realpath(__DIR__ . '/../files');
    }

    // Construct the path.
    $filepath = $base_dir . DIRECTORY_SEPARATOR . $filename;

    // Check the directory part to prevent traversal.
    $dir_part = dirname($filepath);
    $real_dir_part = realpath($dir_part);

    // If the directory doesn't exist or is outside base_dir, it's unsafe.
    if ($real_dir_part === false || strpos($real_dir_part, $base_dir) !== 0) {
        return false;
    }

    // Now check the file itself if it exists.
    if (file_exists($filepath)) {
        $real_filepath = realpath($filepath);
        if ($real_filepath === false || strpos($real_filepath, $base_dir) !== 0) {
            return false;
        }
        return $real_filepath;
    }

    // For non-existent files, we return the path but we need to make sure 
    // it doesn't contain '..' that escapes.
    // We can do this by checking if the directory part is indeed within base_dir.
    // We already did that with $real_dir_part.
    
    // One more thing: if $filename is something like "subdir/../../outside.txt",
    // dirname($filepath) will be "files/subdir/../.." which is "files/../.."
    // and realpath will be "/outside". 
    // So our $real_dir_part check handles this.

    return $filepath;
}

function send_json($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data);
    exit;
}
