# Web Text Editor

A simple, production-ready web-based text editor.

## Features

- List, open, save, rename, and delete files.
- Syntax highlighting with CodeMirror.
- Support for multiple file types (Python, JavaScript, JSON, CSS, HTML, XML).
- JSON formatting.
- Toast notifications for user feedback.
- Loading states for async operations.

## Project Structure

- `app.py`: Entry point for the application.
- `src/`: Main application source code.
    - `app.py`: Application factory.
    - `config.py`: Configuration settings.
    - `routes/`: API route definitions (using Blueprints).
    - `services/`: Core business logic (FileService).
    - `utils/`: Utility functions.
- `static/`: Static assets (CSS, JS).
- `templates/`: HTML templates.
- `files/`: Directory where files are stored.
- `tests/`: Unit tests.

## Getting Started

### Local Development

1.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the application:**
    ```bash
    python app.py
    ```
    The application will be available at `http://127.0.0.1:5000`.

### Using Docker

1.  **Build and run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    The application will be available at `http://localhost:5000`.

## Running Tests

To run the unit tests, use:
```bash
./venv/bin/python3 -m unittest discover tests
```

## Production Deployment

For production, it is recommended to use a WSGI server like `gunicorn`. The provided `Dockerfile` and `docker-compose.yml` are configured to use `gunicorn` when `FLASK_ENV` is set to `production`.
