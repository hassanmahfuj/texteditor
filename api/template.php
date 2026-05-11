<?php
require_once 'utils.php';

$method = $_SERVER['REQUEST_METHOD'];

// Use templates/ directory instead of files/
function get_template_path($name) {
    $base_dir = realpath(__DIR__ . '/../templates');
    if (!$base_dir) {
        mkdir(__DIR__ . '/../templates', 0777, true);
        $base_dir = realpath(__DIR__ . '/../templates');
    }

    $filepath = $base_dir . DIRECTORY_SEPARATOR . $name;
    $dir_part = dirname($filepath);
    $real_dir_part = realpath($dir_part);

    if ($real_dir_part === false || strpos($real_dir_part, $base_dir) !== 0) {
        return false;
    }

    if (file_exists($filepath)) {
        $real_filepath = realpath($filepath);
        if ($real_filepath === false || strpos($real_filepath, $base_dir) !== 0) {
            return false;
        }
        return $real_filepath;
    }

    return $filepath;
}

if ($method === 'GET') {
    $name = $_GET['name'] ?? null;
    if (!$name) {
        send_json(['error' => 'Missing template name'], 400);
    }

    $filepath = get_template_path($name);
    if (!$filepath || !file_exists($filepath)) {
        send_json(['error' => 'Template not found'], 404);
    }

    $content = file_get_contents($filepath);
    send_json(['content' => $content]);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        send_json(['error' => 'No data provided'], 400);
    }

    $action = $input['action'] ?? '';

    if ($action === 'delete') {
        $name = $input['name'] ?? null;
        if (!$name) {
            send_json(['error' => 'Missing template name'], 400);
        }
        $filepath = get_template_path($name);
        if (!$filepath || !file_exists($filepath)) {
            send_json(['error' => 'Template not found'], 404);
        }
        if (unlink($filepath)) {
            send_json(['message' => 'Template deleted successfully']);
        } else {
            send_json(['error' => 'Failed to delete template'], 500);
        }
    } else {
        // Save template
        $name = $input['name'] ?? null;
        $content = $input['content'] ?? null;
        if ($name === null || $content === null) {
            send_json(['error' => 'Missing template name or content'], 400);
        }

        $filepath = get_template_path($name);
        if (!$filepath) {
            send_json(['error' => 'Access denied'], 403);
        }

        if (file_put_contents($filepath, $content) !== false) {
            send_json(['message' => 'Template saved successfully']);
        } else {
            send_json(['error' => 'Failed to save template'], 500);
        }
    }
} else {
    send_json(['error' => 'Method not allowed'], 405);
}
