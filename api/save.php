<?php
require_once 'utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    send_json(['error' => 'No data provided'], 400);
}

$filename = $input['filename'] ?? null;
$content = $input['content'] ?? null;

if ($filename === null || $content === null) {
    send_json(['error' => 'Missing filename or content'], 400);
}

$filepath = get_safe_path($filename);
if (!$filepath) {
    send_json(['error' => 'Access denied'], 403);
}

if (file_put_contents($filepath, $content) !== false) {
    send_json(['message' => 'File saved successfully']);
} else {
    send_json(['error' => 'Failed to save file'], 500);
}
