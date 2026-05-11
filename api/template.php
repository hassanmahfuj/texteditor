<?php
require_once "utils.php";

$method = $_SERVER["REQUEST_METHOD"];

// Use templates/ directory instead of files/
function get_template_path($name)
{
    // Reject empty names
    if (empty($name)) {
        return false;
    }

    // Reject null bytes
    if (strpos($name, "\0") !== false) {
        return false;
    }

    // Reject path separators — no subdirectories allowed
    if (strpos($name, "/") !== false || strpos($name, "\\") !== false) {
        return false;
    }

    // Strip any path components as a safety net
    $safe_name = basename($name);

    // Reject names with no extension
    $ext = strtolower(pathinfo($safe_name, PATHINFO_EXTENSION));
    if ($ext === "") {
        return false;
    }

    // Validate extension — reuse the same whitelist as files directory
    if (!in_array($ext, ALLOWED_EXTENSIONS, true)) {
        return false;
    }

    // Ensure the resolved base directory exists
    $base_dir = realpath(__DIR__ . "/../templates");
    if (!$base_dir) {
        mkdir(__DIR__ . "/../templates", 0755, true);
        $base_dir = realpath(__DIR__ . "/../templates");
    }

    $filepath = $base_dir . DIRECTORY_SEPARATOR . $safe_name;

    // Defense-in-depth: verify realpath matches for existing files
    if (file_exists($filepath)) {
        $real_filepath = realpath($filepath);
        if ($real_filepath === false || $real_filepath !== $filepath) {
            return false;
        }
        return $real_filepath;
    }

    return $filepath;
}

if ($method === "GET") {
    $name = $_GET["name"] ?? null;
    if (!$name) {
        send_json(["error" => "Missing template name"], 400);
    }

    $filepath = get_template_path($name);
    if (!$filepath || !file_exists($filepath)) {
        send_json(["error" => "Template not found"], 404);
    }

    $content = file_get_contents($filepath);
    send_json(["content" => $content]);
} elseif ($method === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) {
        send_json(["error" => "No data provided"], 400);
    }

    $action = $input["action"] ?? "";

    if ($action === "delete") {
        $name = $input["name"] ?? null;
        if (!$name) {
            send_json(["error" => "Missing template name"], 400);
        }
        $filepath = get_template_path($name);
        if (!$filepath || !file_exists($filepath)) {
            send_json(["error" => "Template not found"], 404);
        }
        if (unlink($filepath)) {
            send_json(["message" => "Template deleted successfully"]);
        } else {
            send_json(["error" => "Failed to delete template"], 500);
        }
    } else {
        // Save template
        $name = $input["name"] ?? null;
        $content = $input["content"] ?? null;
        if ($name === null || $content === null) {
            send_json(["error" => "Missing template name or content"], 400);
        }

        $filepath = get_template_path($name);
        if (!$filepath) {
            send_json(["error" => "Access denied"], 403);
        }

        if (file_put_contents($filepath, $content) !== false) {
            send_json(["message" => "Template saved successfully"]);
        } else {
            send_json(["error" => "Failed to save template"], 500);
        }
    }
} else {
    send_json(["error" => "Method not allowed"], 405);
}
