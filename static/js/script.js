document.addEventListener('DOMContentLoaded', () => {
    const fileListElement = document.getElementById('file-list');
    const newFileBtn = document.getElementById('new-file-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const formatBtn = document.getElementById('format-btn');
    const saveBtn = document.getElementById('save-btn');
    const currentFilenameElement = document.getElementById('current-filename');
    const editorTextArea = document.getElementById('code-editor');
    const toastContainer = document.getElementById('toast-container');
    
    // Context Menu Elements
    const contextMenu = document.getElementById('context-menu');
    const renameOption = document.getElementById('rename-option');
    const deleteOption = document.getElementById('delete-option');

    let currentFilename = null;
    let contextTargetFile = null;
    let isProcessing = false;

    // Initialize CodeMirror
    const editor = CodeMirror.fromTextArea(editorTextArea, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'text/plain',
        lineWrapping: true
    });

    // --- Utility Functions ---

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('slide-out'); // Note: I should probably add slide-out animation in CSS
            // For simplicity in this refactor, I'll just remove it
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async function toggleLoading(loading) {
        isProcessing = loading;
        const buttons = [newFileBtn, sampleBtn, formatBtn, saveBtn, renameOption, deleteOption];
        buttons.forEach(btn => {
            if (btn) btn.disabled = loading;
        });
        // Also disable file list items
        const listItems = fileListElement.querySelectorAll('li');
        listItems.forEach(li => li.style.pointerEvents = loading ? 'none' : 'auto');
    }

    function getModeFromFilename(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        switch (ext) {
            case 'py': return 'python';
            case 'js': return 'javascript';
            case 'java': return 'text/x-java';
            case 'json': return 'application/json';
            case 'css': return 'css';
            case 'html': return 'text/html';
            case 'xml': return 'xml';
            default: return 'text/plain';
        }
    }

    // --- API Functions ---

    async function loadFileList() {
        try {
            const response = await fetch('/api/files');
            if (!response.ok) throw new Error('Failed to load files');
            const files = await response.json();
            
            fileListElement.innerHTML = '';
            files.forEach(filename => {
                const li = document.createElement('li');
                li.textContent = filename;
                li.addEventListener('click', () => loadFile(filename));
                fileListElement.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading file list:', error);
            showToast('Error loading file list', 'error');
        }
    }

    async function loadFile(filename) {
        if (isProcessing) return;
        await toggleLoading(true);

        try {
            const response = await fetch(`/api/file/${filename}`);
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            currentFilename = filename;
            currentFilenameElement.textContent = filename;
            editor.setValue(data.content);
            editor.setOption('mode', getModeFromFilename(filename));

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
            showToast('Error loading file', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    async function saveFile() {
        if (!currentFilename) {
            showToast('No file selected to save!', 'error');
            return;
        }

        await toggleLoading(true);
        const content = editor.getValue();
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: currentFilename, content }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast('File saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Error saving file:', error);
            showToast('Error saving file', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    async function renameFile(oldName, newName) {
        await toggleLoading(true);
        try {
            const response = await fetch('/api/rename', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ old_filename: oldName, new_filename: newName }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                if (currentFilename === oldName) {
                    currentFilename = newName;
                    currentFilenameElement.textContent = newName;
                    editor.setOption('mode', getModeFromFilename(newName));
                }
                await loadFileList();
                showToast('File renamed successfully', 'success');
            }
        } catch (error) {
            console.error('Error renaming file:', error);
            showToast('Error renaming file', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    async function deleteFile(filename) {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        await toggleLoading(true);
        try {
            const response = await fetch(`/api/file/${filename}`, { method: 'DELETE' });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                if (currentFilename === filename) {
                    currentFilename = null;
                    currentFilenameElement.textContent = 'No file selected';
                    editor.setValue('');
                }
                await loadFileList();
                showToast('File deleted successfully', 'success');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            showToast('Error deleting file', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    async function createNewFile() {
        const filename = prompt('Enter new filename (including extension, e.g., hello.py):');
        if (!filename) return;

        await toggleLoading(true);
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content: '' }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                await loadFileList();
                await loadFile(filename);
                showToast('New file created', 'success');
            }
        } catch (error) {
            console.error('Error creating file:', error);
            showToast('Error creating file', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    async function formatContent() {
        if (!currentFilename) {
            showToast("No file selected to format.", "error");
            return;
        }

        const content = editor.getValue();
        const ext = currentFilename.split('.').pop().toLowerCase();

        try {
            if (ext === 'json') {
                const parsed = JSON.parse(content);
                const formatted = JSON.stringify(parsed, null, 2);
                editor.setValue(formatted);
                showToast('JSON formatted', 'success');
            } else {
                showToast("Formatting is currently only supported for JSON files.", "info");
            }
        } catch (e) {
            showToast("Error formatting content: " + e.message, "error");
        }
    }

    async function handleSample() {
        let filename = prompt('Enter sample filename (will append .json):');
        if (!filename) return;
        if (!filename.endsWith('.json')) filename += '.json';

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

        await toggleLoading(true);
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                await loadFileList();
                await loadFile(filename);
                showToast('Sample file created', 'success');
            }
        } catch (error) {
            console.error('Error creating sample file:', error);
            showToast('Error creating sample file', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    // --- Event Listeners ---

    fileListElement.addEventListener('contextmenu', (e) => {
        const li = e.target.closest('li');
        if (li) {
            e.preventDefault();
            contextTargetFile = li.textContent;
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
        }
    });

    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    renameOption.addEventListener('click', async () => {
        if (!contextTargetFile) return;
        contextMenu.style.display = 'none';
        const newName = prompt('Enter new filename:', contextTargetFile);
        if (newName && newName !== contextTargetFile) {
            await renameFile(contextTargetFile, newName);
        }
    });

    deleteOption.addEventListener('click', async () => {
        if (!contextTargetFile) return;
        contextMenu.style.display = 'none';
        await deleteFile(contextTargetFile);
    });

    saveBtn.addEventListener('click', saveFile);
    newFileBtn.addEventListener('click', createNewFile);
    formatBtn.addEventListener('click', formatContent);
    sampleBtn.addEventListener('click', handleSample);

    // Initial load
    loadFileList();
});
