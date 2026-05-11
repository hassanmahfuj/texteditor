<?php
require_once "utils.php";

$method = $_SERVER["REQUEST_METHOD"];
$filename = $_GET["filename"] ?? null;

if (!$filename) {
    send_json(["error" => "Missing filename"], 400);
}

$filepath = get_safe_path($filename);
if (!$filepath) {
    send_json(["error" => "Access denied or file not found"], 403);
}

if ($method === "GET") {
    if (!file_exists($filepath)) {
        send_json(["error" => "File not found"], 404);
    }
    $content = file_get_contents($filepath);
    send_json(["content" => $content]);
} elseif ($method === "POST") {
    // Handle delete via POST (cPanel servers often block DELETE method)
    $input = json_decode(file_get_contents("php://input"), true);
    $action = $input["action"] ?? "";

    if ($action === "delete") {
        if (!file_exists($filepath)) {
            send_json(["error" => "File not found"], 404);
        }
        if (unlink($filepath)) {
            send_json(["message" => "File deleted successfully"]);
        } else {
            send_json(["error" => "Failed to delete file"], 500);
        }
    } else {
        send_json(["error" => "Unknown action"], 400);
    }
} else {
    send_json(["error" => "Method not allowed"], 405);
}
