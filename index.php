<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Text Editor</title>
    <link rel="icon" href="static/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="static/css/style.css">
    <!-- CodeMirror CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/theme/dracula.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/fold/foldgutter.min.css">
    <!-- CodeMirror JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.js"></script>
    <!-- CodeMirror Modes -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/javascript/javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/python/python.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/clike/clike.min.js"></script> <!-- For Java -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/text/x-text.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/xml/xml.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/css/css.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/htmlmixed/htmlmixed.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/mode/json/json.min.js"></script>
    <!-- CodeMirror Fold Addons -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/fold/foldcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/fold/foldgutter.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/addon/fold/brace-fold.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="sidebar-header">
                <h3>Files</h3>
                <div class="header-buttons">
                    <button id="templates-btn">Templates</button>
                    <button id="new-file-btn">New</button>
                </div>
            </div>
            <ul id="file-list">
                <!-- Files will be populated here -->
            </ul>
        </div>
        <div class="main-editor">
            <div class="toolbar">
                <span id="current-filename">No file selected</span>
                <div class="toolbar-buttons">
                    <button id="format-btn">Format</button>
                    <button id="save-as-template-btn">Save as Template</button>
                    <button id="save-btn">Save</button>
                </div>
            </div>
            <div id="editor-container">
                <textarea id="code-editor"></textarea>
            </div>
        </div>
    </div>

    <!-- Context Menu -->
    <div id="context-menu" class="context-menu">
        <ul>
            <li id="rename-option">Rename</li>
            <li id="delete-option" class="delete-item">Delete</li>
        </ul>
    </div>

    <!-- Templates Dialog -->
    <div id="templates-dialog" class="dialog-overlay">
        <div class="dialog">
            <div class="dialog-header">
                <h3>Templates</h3>
                <button id="dialog-close-btn" class="dialog-close-btn">&times;</button>
            </div>
            <ul id="template-list" class="template-list">
                <!-- Templates populated here -->
            </ul>
        </div>
    </div>

    <div id="toast-container" class="toast-container"></div>
    <script src="static/js/script.js"></script>
</body>
</html>
