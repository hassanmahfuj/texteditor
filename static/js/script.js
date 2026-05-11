document.addEventListener('DOMContentLoaded', () => {
    const fileListElement = document.getElementById('file-list');
    const newFileBtn = document.getElementById('new-file-btn');
    const templatesBtn = document.getElementById('templates-btn');
    const formatBtn = document.getElementById('format-btn');
    const saveAsTemplateBtn = document.getElementById('save-as-template-btn');
    const saveBtn = document.getElementById('save-btn');
    const currentFilenameElement = document.getElementById('current-filename');
    const editorTextArea = document.getElementById('code-editor');
    const toastContainer = document.getElementById('toast-container');
    
    // Context Menu Elements
    const contextMenu = document.getElementById('context-menu');
    const renameOption = document.getElementById('rename-option');
    const deleteOption = document.getElementById('delete-option');

    // Templates Dialog Elements
    const templatesDialog = document.getElementById('templates-dialog');
    const dialogCloseBtn = document.getElementById('dialog-close-btn');
    const templateListElement = document.getElementById('template-list');

    let currentFilename = null;
    let contextTargetFile = null;
    let isProcessing = false;

    // Initialize CodeMirror
    const editor = CodeMirror.fromTextArea(editorTextArea, {
        lineNumbers: true,
        theme: 'dracula',
        mode: 'text/plain',
        lineWrapping: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        foldGutter: {
            rangeFinder: CodeMirror.fold.brace
        }
    });

    // --- Utility Functions ---

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('slide-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    async function toggleLoading(loading) {
        isProcessing = loading;
        const buttons = [newFileBtn, templatesBtn, formatBtn, saveAsTemplateBtn, saveBtn, renameOption, deleteOption];
        buttons.forEach(btn => {
            if (btn) btn.disabled = loading;
        });
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

    // --- File API Functions ---

    async function loadFileList() {
        try {
            const response = await fetch('api/files.php');
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

    async function openFile(filename) {
        try {
            const response = await fetch(`api/file.php?filename=${encodeURIComponent(filename)}`);
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
        }
    }

    async function loadFile(filename) {
        if (isProcessing) return;
        await toggleLoading(true);
        try {
            await openFile(filename);
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
            const response = await fetch('api/save.php', {
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
            const response = await fetch('api/rename.php', {
                method: 'POST',
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
            const response = await fetch(`api/file.php?filename=${encodeURIComponent(filename)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete' }),
            });
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
            const response = await fetch('api/save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content: '' }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                await loadFileList();
                await openFile(filename);
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

    // --- Template API Functions ---

    async function loadTemplateList() {
        try {
            const response = await fetch('api/templates.php');
            if (!response.ok) throw new Error('Failed to load templates');
            const templates = await response.json();

            templateListElement.innerHTML = '';

            if (templates.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No templates available';
                li.style.color = '#636d83';
                li.style.cursor = 'default';
                templateListElement.appendChild(li);
                return;
            }

            templates.forEach(name => {
                const li = document.createElement('li');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'template-name';
                nameSpan.textContent = name;
                nameSpan.addEventListener('click', () => useTemplate(name));

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'template-delete-btn';
                deleteBtn.innerHTML = '✕';
                deleteBtn.title = 'Delete template';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTemplate(name);
                });

                li.appendChild(nameSpan);
                li.appendChild(deleteBtn);
                templateListElement.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading templates:', error);
            showToast('Error loading templates', 'error');
        }
    }

    async function useTemplate(name) {
        await toggleLoading(true);
        try {
            const response = await fetch(`api/template.php?name=${encodeURIComponent(name)}`);
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            // Create a new file from template
            // Carry forward template extension if user doesn't provide one
            const templateExt = name.includes('.') ? '.' + name.split('.').pop() : '';
            let filename = prompt('Enter filename for the new file:', name);
            if (!filename) return;
            if (templateExt && !filename.includes('.')) {
                filename += templateExt;
            }

            const response2 = await fetch('api/save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content: data.content }),
            });
            const data2 = await response2.json();

            if (data2.error) {
                showToast(data2.error, 'error');
                return;
            }

            await loadFileList();
            await openFile(filename);
            closeTemplatesDialog();
            showToast('File created from template', 'success');
        } catch (error) {
            console.error('Error using template:', error);
            showToast('Error using template', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    async function deleteTemplate(name) {
        if (!confirm(`Delete template "${name}"?`)) return;

        try {
            const response = await fetch('api/template.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', name }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                await loadTemplateList();
                showToast('Template deleted', 'success');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            showToast('Error deleting template', 'error');
        }
    }

    async function saveAsTemplate() {
        const content = editor.getValue();
        if (!content.trim()) {
            showToast('Editor is empty, nothing to save as template', 'error');
            return;
        }

        const name = prompt('Enter template name (e.g., my-template.json):');
        if (!name) return;

        await toggleLoading(true);
        try {
            const response = await fetch('api/template.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, content }),
            });
            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(`Template "${name}" saved`, 'success');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            showToast('Error saving template', 'error');
        } finally {
            await toggleLoading(false);
        }
    }

    function openTemplatesDialog() {
        templatesDialog.classList.add('active');
        loadTemplateList();
    }

    function closeTemplatesDialog() {
        templatesDialog.classList.remove('active');
    }

    // --- Event Listeners ---

    // File context menu
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

    // Templates dialog
    templatesBtn.addEventListener('click', openTemplatesDialog);
    dialogCloseBtn.addEventListener('click', closeTemplatesDialog);
    templatesDialog.addEventListener('click', (e) => {
        if (e.target === templatesDialog) closeTemplatesDialog();
    });

    // Toolbar buttons
    saveBtn.addEventListener('click', saveFile);
    saveAsTemplateBtn.addEventListener('click', saveAsTemplate);
    newFileBtn.addEventListener('click', createNewFile);
    formatBtn.addEventListener('click', formatContent);

    // Keyboard shortcut: Escape to close dialog
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && templatesDialog.classList.contains('active')) {
            closeTemplatesDialog();
        }
    });

    // Initial load
    loadFileList();
});
