<?php
require_once "utils.php";

$method = $_SERVER["REQUEST_METHOD"];
if ($method !== "POST") {
    send_json(["error" => "Method not allowed"], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    send_json(["error" => "No data provided"], 400);
}

$old_filename = $input["old_filename"] ?? null;
$new_filename = $input["new_filename"] ?? null;

if (!$old_filename || !$new_filename) {
    send_json(["error" => "Missing filename"], 400);
}

$old_filepath = get_safe_path($old_filename);
$new_filepath = get_safe_path($new_filename);

if (!$old_filepath || !$new_filepath) {
    send_json(["error" => "Access denied"], 403);
}

if (!file_exists($old_filepath)) {
    send_json(["error" => "Original file not found"], 404);
}

if (file_exists($new_filepath)) {
    send_json(["error" => "New filename already exists"], 400);
}

if (rename($old_filepath, $new_filepath)) {
    send_json(["message" => "File renamed successfully"]);
} else {
    send_json(["error" => "Failed to rename file"], 500);
}
