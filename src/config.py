import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-for-only-development')
    BASE_DIR = os.path.abspath(os.path.join(os.getcwd(), 'files'))
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'

class ProductionConfig(Config):
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig
}
