from src.app import create_app
import os

# Determine configuration based on environment variable
config_name = os.environ.get('FLASK_ENV', 'development')

app = create_app(config_name)

if __name__ == '__main__':
    app.run()
