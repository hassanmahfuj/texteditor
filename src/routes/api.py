from flask import Blueprint, jsonify, request, current_app
from src.services.file_service import (
    FileService, 
    FileServiceError, 
    FileNotFoundError, 
    FileAccessDeniedError, 
    FileAlreadyExistsError
)

api_bp = Blueprint('api', __name__)

def get_file_service() -> FileService:
    return current_app.config['FILE_SERVICE']

@api_bp.route('/files', methods=['GET'])
def list_files():
    try:
        files = get_file_service().list_files()
        return jsonify(files)
    except FileServiceError as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/file/<path:filename>', methods=['GET'])
def get_file(filename):
    try:
        content = get_file_service().get_file_content(filename)
        return jsonify({"content": content})
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except FileAccessDeniedError as e:
        return jsonify({"error": str(e)}), 403
    except FileServiceError as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/save', methods=['POST'])
def save_file():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    filename = data.get('filename')
    content = data.get('content')

    if not filename or content is None:
        return jsonify({"error": "Missing filename or content"}), 400

    try:
        get_file_service().save_file(filename, content)
        return jsonify({"message": "File saved successfully"})
    except FileAccessDeniedError as e:
        return jsonify({"error": str(e)}), 403
    except FileServiceError as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/rename', methods=['PUT'])
def rename_file():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    old_filename = data.get('old_filename')
    new_filename = data.get('new_filename')

    if not old_filename or not new_filename:
        return jsonify({"error": "Missing filename"}), 400

    try:
        get_file_service().rename_file(old_filename, new_filename)
        return jsonify({"message": "File renamed successfully"})
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except FileAccessDeniedError as e:
        return jsonify({"error": str(e)}), 403
    except FileAlreadyExistsError as e:
        return jsonify({"error": str(e)}), 400
    except FileServiceError as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/file/<path:filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        get_file_service().delete_file(filename)
        return jsonify({"message": "File deleted successfully"})
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except FileAccessDeniedError as e:
        return jsonify({"error": str(e)}), 403
    except FileServiceError as e:
        return jsonify({"error": str(e)}), 500
