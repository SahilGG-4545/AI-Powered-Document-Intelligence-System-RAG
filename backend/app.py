"""
Main Flask application entry point
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes import auth, documents, chat
from database import init_db

def create_app(config_class=Config):
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions - CORS must be set up BEFORE routes
    CORS(app, 
         origins=["http://localhost:3000", "http://localhost:5173"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         expose_headers=["Content-Type", "Authorization"])
    
    JWTManager(app)
    
    # Disable strict slashes to prevent redirects
    app.url_map.strict_slashes = False
    
    # Initialize database
    init_db()
    
    # Create necessary directories
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['VECTOR_STORE_PATH'], exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(documents.bp, url_prefix='/api/documents')
    app.register_blueprint(chat.bp, url_prefix='/api/chat')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'message': 'API is running'}, 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
