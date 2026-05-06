from flask import Flask, render_template
from src.config import config_by_name
from src.routes.api import api_bp
from src.services.file_service import FileService

def create_app(config_name='development'):
    app = Flask(__name__, 
                template_folder='../templates', 
                static_folder='../static')
    
    app.config.from_object(config_by_name[config_name])

    # Initialize FileService
    service = FileService(app.config['BASE_DIR'])
    
    # Store service in app config for easy access in blueprints
    app.config['FILE_SERVICE'] = service

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return render_template('index.html')

    return app
