document.addEventListener('DOMContentLoaded', () => {
    const fileListElement = document.getElementById('file-list');
    const newFileBtn = document.getElementById('new-file-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const formatBtn = document.getElementById('format-btn');
    const saveBtn = document.getElementById('save-btn');
    const currentFilenameElement = document.getElementById('current-filename');
    const editorTextArea = document.getElementById('code-editor');
    
    // Context Menu Elements
    const contextMenu = document.getElementById('context-menu');
    const renameOption = document.getElementById('rename-option');
    const deleteOption = document.getElementById('delete-option');

    let currentFilename = null;
    let contextTargetFile = null;

    // Initialize CodeMirror
    const editor = CodeMirror.fromTextArea(editorTextArea, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'text/plain',
        lineWrapping: true
    });

    // Function to get CodeMirror mode based on file extension
    function getModeFromFilename(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'py': return 'python';
            case 'js': return 'javascript';
            case 'java': return 'text/x-java'; // clike mode handles java
            case 'json': return 'application/json';
            case 'css': return 'css';
            case 'html': return 'text/html';
            case 'xml': return 'xml';
            default: return 'text/plain';
        }
    }

    // Function to load file list
    async function loadFileList() {
        try {
            const response = await fetch('/api/files');
            const files = await response.json();
            
            fileListElement.innerHTML = '';
            files.forEach(filename => {
                const li = document.createElement('li');
                li.textContent = filename;
                
                // Left click to open file
                li.addEventListener('click', () => loadFile(filename));

                fileListElement.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading file list:', error);
        }
    }

    // Context menu delegation
    fileListElement.addEventListener('contextmenu', (e) => {
        const li = e.target.closest('li');
        if (li) {
            e.preventDefault();
            const filename = li.textContent;
            showContextMenu(e, filename);
        }
    });

    // Show context menu
    function showContextMenu(e, filename) {
        contextTargetFile = filename;
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
    }

    // Hide context menu when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    // Rename File logic
    renameOption.addEventListener('click', async () => {
        if (!contextTargetFile) return;
        
        contextMenu.style.display = 'none';

        const newName = prompt('Enter new filename:', contextTargetFile);
        if (!newName || newName === contextTargetFile) return;

        try {
            const response = await fetch('/api/rename', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_filename: contextTargetFile,
                    new_filename: newName
                }),
            });
            const data = await response.json();

            if (data.error) {
                alert('Error renaming file: ' + data.error);
            } else {
                // If the renamed file was the currently open one, update it
                if (currentFilename === contextTargetFile) {
                    currentFilename = newName;
                    currentFilenameElement.textContent = newName;
                    editor.setOption('mode', getModeFromFilename(newName));
                }
                await loadFileList();
            }
        } catch (error) {
            console.error('Error renaming file:', error);
            alert('Error renaming file. Check console.');
        }
    });

    // Delete File logic
    deleteOption.addEventListener('click', async () => {
        if (!contextTargetFile) return;

        contextMenu.style.display = 'none';

        if (!confirm(`Are you sure you want to delete ${contextTargetFile}?`)) return;

        try {
            const response = await fetch(`/api/file/${contextTargetFile}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.error) {
                alert('Error deleting file: ' + data.error);
            } else {
                // If the deleted file was the currently open one, clear the editor
                if (currentFilename === contextTargetFile) {
                    currentFilename = null;
                    currentFilenameElement.textContent = 'No file selected';
                    editor.setValue('');
                }
                await loadFileList();
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Error deleting file. Check console.');
        }
    });

    // Function to load a file
    async function loadFile(filename) {
        try {
            const response = await fetch(`/api/file/${filename}`);
            const data = await response.json();

            if (data.error) {
                alert('Error loading file: ' + data.error);
                return;
            }

            currentFilename = filename;
            currentFilenameElement.textContent = filename;
            editor.setValue(data.content);
            editor.setOption('mode', getModeFromFilename(filename));

            // Update active class in sidebar
            const listItems = fileListElement.querySelectorAll('li');
            listItems.forEach(li => {
                if (li.textContent === filename) {
                    li.classList.add('active');
                } else {
                    li.classList.remove('active');
                }
            });

        } catch (error) {
            console.error('Error loading file:', error);
        }
    }

    // Function to save current file
    async function saveFile() {
        if (!currentFilename) {
            alert('No file selected to save!');
            return;
        }

        const content = editor.getValue();
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: currentFilename,
                    content: content
                }),
            });
            const data = await response.json();

            if (data.error) {
                alert('Error saving file: ' + data.error);
            } else {
                alert('File saved successfully!');
            }
        } catch (error) {
            console.error('Error saving file:', error);
            alert('Error saving file. Check console for details.');
        }
    }

    // Function to format content
    async function formatContent() {
        const content = editor.getValue();
        if (!currentFilename) {
            alert("No file selected to format.");
            return;
        }

        const ext = currentFilename.split('.').pop().toLowerCase();

        try {
            if (ext === 'json') {
                const parsed = JSON.parse(content);
                const formatted = JSON.stringify(parsed, null, 2);
                editor.setValue(formatted);
            } else {
                alert("Formatting is currently only supported for JSON files.");
            }
        } catch (e) {
            alert("Error formatting content: " + e.message);
        }
    }

    // Function to create a new file
    async function createNewFile() {
        const filename = prompt('Enter new filename (including extension, e.g., hello.py):');
        if (!filename) return;

        try {
            // We can use the save API to create a new empty file
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: filename,
                    content: ''
                }),
            });
            const data = await response.json();

            if (data.error) {
                alert('Error creating file: ' + data.error);
            } else {
                await loadFileList();
                loadFile(filename);
            }
        } catch (error) {
            console.error('Error creating file:', error);
        }
    }

    sampleBtn.addEventListener('click', async () => {
        let filename = prompt('Enter sample filename (will append .json):');
        if (!filename) return;

        if (!filename.endsWith('.json')) {
            filename += '.json';
        }

        const content = `{
  "configuration": {
    "CURRENT_DATE": "2024-12-01"
  },
  "product": {
    "scheduleDaysAsDivisor": true,
    "productCalculationBasedOn": "DAILY"
  },
  "account": {},
  "request": {},
  "response": {}
}`;

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filename: filename,
                    content: content
                }),
            });
            const data = await response.json();

            if (data.error) {
                alert('Error creating sample file: ' + data.error);
            } else {
                await loadFileList();
                loadFile(filename);
            }
        } catch (error) {
            console.error('Error creating sample file:', error);
            alert('Error creating sample file. Check console.');
        }
    });

    // Event Listeners
    saveBtn.addEventListener('click', saveFile);
    newFileBtn.addEventListener('click', createNewFile);
    formatBtn.addEventListener('click', formatContent);

    // Initial load
    loadFileList();
});
