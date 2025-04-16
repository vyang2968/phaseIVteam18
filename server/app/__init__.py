from flask import Flask
from app.db_connection import close_all_db_connections
import atexit
from app.routes.airplane_routes import airplane_bp

def create_app():
    app = Flask(__name__)
        
    # Import and register blueprints
    
    app.register_blueprint(airplane_bp)
    
    atexit.register(close_all_db_connections)
    
    return app
