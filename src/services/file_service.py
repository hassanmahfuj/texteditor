import os
import shutil
from typing import List, Optional

class FileServiceError(Exception):
    """Base class for exceptions in this module."""
    pass

class FileNotFoundError(FileServiceError):
    """Exception raised when a file is not found."""
    pass

class FileAccessDeniedError(FileServiceError):
    """Exception raised when access to a file is denied."""
    pass

class FileAlreadyExistsError(FileServiceError):
    """Exception raised when a file already exists."""
    pass

class FileOperationError(FileServiceError):
    """Exception raised when a file operation fails."""
    pass

class FileService:
    def __init__(self, base_dir: str):
        self.base_dir = os.path.abspath(base_dir)
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def _get_safe_path(self, filename: str) -> str:
        """Ensures the path is within the base directory."""
        filepath = os.path.abspath(os.path.join(self.base_dir, filename))
        if not filepath.startswith(self.base_dir):
            raise FileAccessDeniedError(f"Access denied for file: {filename}")
        return filepath

    def list_files(self) -> List[str]:
        try:
            return [
                f for f in os.listdir(self.base_dir)
                if os.path.isfile(os.path.join(self.base_dir, f))
            ]
        except Exception as e:
            raise FileOperationError(f"Error listing files: {str(e)}")

    def get_file_content(self, filename: str) -> str:
        filepath = self._get_safe_path(filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filename}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            raise FileOperationError(f"Error reading file: {str(e)}")

    def save_file(self, filename: str, content: str) -> None:
        filepath = self._get_safe_path(filename)
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        except Exception as e:
            raise FileOperationError(f"Error saving file: {str(e)}")

    def rename_file(self, old_filename: str, new_filename: str) -> None:
        old_filepath = self._get_safe_path(old_filename)
        new_filepath = self._get_safe_path(new_filename)

        if not os.path.exists(old_filepath):
            raise FileNotFoundError(f"Original file not found: {old_filename}")
        
        if os.path.exists(new_filepath):
            raise FileAlreadyExistsError(f"New filename already exists: {new_filename}")

        try:
            os.rename(old_filepath, new_filepath)
        except Exception as e:
            raise FileOperationError(f"Error renaming file: {str(e)}")

    def delete_file(self, filename: str) -> None:
        filepath = self._get_safe_path(filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filename}")

        try:
            os.remove(filepath)
        except Exception as e:
            raise FileOperationError(f"Error deleting file: {str(e)}")
