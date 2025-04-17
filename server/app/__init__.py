from flask import Flask
from app.db_connection import close_all_db_connections
import atexit
from app.routes.tables.airplane_routes import airplane_bp
from app.routes.tables.airline_routes import airline_bp
from app.routes.general_routes import general_bp
from app.routes.views.views_routes import views_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
        
    # Import and register blueprints
    app.register_blueprint(airplane_bp)
    app.register_blueprint(airline_bp)
    
    app.register_blueprint(general_bp)
    app.register_blueprint(views_bp)
    
    atexit.register(close_all_db_connections)
    
    return app
