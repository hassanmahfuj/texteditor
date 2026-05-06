import unittest
import os
import shutil
import tempfile
from src.services.file_service import FileService, FileNotFoundError, FileAlreadyExistsError, FileOperationError

class TestFileService(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for testing
        self.test_dir = tempfile.mkdtemp()
        self.file_service = FileService(self.test_dir)

    def tearDown(self):
        # Remove the directory after the test
        shutil.rmtree(self.test_dir)

    def test_list_files(self):
        # Create some dummy files
        with open(os.path.join(self.test_dir, 'file1.txt'), 'w') as f:
            f.write('content1')
        with open(os.path.join(self.test_dir, 'file2.txt'), 'w') as f:
            f.write('content2')
        
        files = self.file_service.list_files()
        self.assertIn('file1.txt', files)
        self.assertIn('file2.txt', files)
        self.assertEqual(len(files), 2)

    def test_get_file_content(self):
        filename = 'test.txt'
        content = 'hello world'
        with open(os.path.join(self.test_dir, filename), 'w') as f:
            f.write(content)
        
        self.assertEqual(self.file_service.get_file_content(filename), content)

    def test_get_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            self.file_service.get_file_content('nonexistent.txt')

    def test_save_file(self):
        filename = 'new_file.txt'
        content = 'new content'
        self.file_service.save_file(filename, content)
        
        with open(os.path.join(self.test_dir, filename), 'r') as f:
            self.assertEqual(f.read(), content)

    def test_rename_file(self):
        old_name = 'old.txt'
        new_name = 'new.txt'
        with open(os.path.join(self.test_dir, old_name), 'w') as f:
            f.write('old content')
        
        self.file_service.rename_file(old_name, new_name)
        
        self.assertTrue(os.path.exists(os.path.join(self.test_dir, new_name)))
        self.assertFalse(os.path.exists(os.path.join(self.test_dir, old_name)))

    def test_rename_file_already_exists(self):
        with open(os.path.join(self.test_dir, 'file1.txt'), 'w') as f:
            f.write('c1')
        with open(os.path.join(self.test_dir, 'file2.txt'), 'w') as f:
            f.write('c2')
            
        with self.assertRaises(FileAlreadyExistsError):
            self.file_service.rename_file('file1.txt', 'file2.txt')

    def test_delete_file(self):
        filename = 'delete_me.txt'
        with open(os.path.join(self.test_dir, filename), 'w') as f:
            f.write('bye')
        
        self.file_service.delete_file(filename)
        self.assertFalse(os.path.exists(os.path.join(self.test_dir, filename)))

    def test_delete_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            self.file_service.delete_file('not_there.txt')

if __name__ == '__main__':
    unittest.main()
