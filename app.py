import os
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__)

# Directory where files will be stored.
BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), 'files'))

# Create the directory if it doesn't exist
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/files', methods=['GET'])
def list_files():
    files = []
    try:
        for filename in os.listdir(BASE_DIR):
            filepath = os.path.join(BASE_DIR, filename)
            if os.path.isfile(filepath):
                files.append(filename)
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/file/<path:filename>', methods=['GET'])
def get_file(filename):
    filepath = os.path.join(BASE_DIR, filename)
    # Security check: ensure the file is within BASE_DIR
    if not os.path.abspath(filepath).startswith(BASE_DIR):
        return jsonify({"error": "Access denied"}), 403
    
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_file():
    data = request.json
    filename = data.get('filename')
    content = data.get('content')

    if not filename or content is None:
        return jsonify({"error": "Missing filename or content"}), 400

    filepath = os.path.join(BASE_DIR, filename)
    # Security check
    if not os.path.abspath(filepath).startswith(BASE_DIR):
        return jsonify({"error": "Access denied"}), 403

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"message": "File saved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/rename', methods=['PUT'])
def rename_file():
    data = request.json
    old_filename = data.get('old_filename')
    new_filename = data.get('new_filename')

    if not old_filename or not new_filename:
        return jsonify({"error": "Missing filename"}), 400

    old_filepath = os.path.join(BASE_DIR, old_filename)
    new_filepath = os.path.join(BASE_DIR, new_filename)

    # Security check
    if not os.path.abspath(old_filepath).startswith(BASE_DIR) or \
       not os.path.abspath(new_filepath).startswith(BASE_DIR):
        return jsonify({"error": "Access denied"}), 403

    if not os.path.exists(old_filepath):
        return jsonify({"error": "Original file not found"}), 404
    
    if os.path.exists(new_filepath):
        return jsonify({"error": "New filename already exists"}), 400

    try:
        os.rename(old_filepath, new_filepath)
        return jsonify({"message": "File renamed successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/file/<path:filename>', methods=['DELETE'])
def delete_file(filename):
    filepath = os.path.join(BASE_DIR, filename)
    # Security check
    if not os.path.abspath(filepath).startswith(BASE_DIR):
        return jsonify({"error": "Access denied"}), 403

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    try:
        os.remove(filepath)
        return jsonify({"message": "File deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
