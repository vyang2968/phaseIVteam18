from flask import Flask
from app.db_connection import close_all_db_connections
import atexit
from app.routes.general_routes import general_bp
from app.routes.views.views_routes import views_bp
from flask_cors import CORS

from app.routes.tables.airline_routes import airline_bp
from app.routes.tables.airplane_routes import airplane_bp
from app.routes.tables.airport_routes import airport_bp
from app.routes.tables.flight_routes import flight_bp
from app.routes.tables.leg_routes import leg_bp
from app.routes.tables.location_routes import location_bp
from app.routes.tables.passenger_routes import passenger_bp
from app.routes.tables.passenger_vacations_routes import passenger_vacations_bp
from app.routes.tables.person_routes import person_bp
from app.routes.tables.pilot_licenses_routes import pilot_licenses_bp
from app.routes.tables.pilot_routes import pilot_bp
from app.routes.tables.route_path_routes import route_path_bp
from app.routes.tables.route_routes import route_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
        
    # Import and register blueprints
    app.register_blueprint(airline_bp)
    app.register_blueprint(airplane_bp)
    app.register.blueprint(airport_bp)
    app.register.blueprint(flight_bp)
    app.register.blueprint(leg_bp)
    app.register.blueprint(location_bp)
    app.register.blueprint(passenger_bp)
    app.register.blueprint(passenger_vacations_bp)
    app.register.blueprint(person_bp)
    app.register.blueprint(pilot_licenses_bp)
    app.register.blueprint(pilot_bp)
    app.register.blueprint(route_path_bp)
    app.register.blueprint(route_bp)
    
    app.register_blueprint(general_bp)
    app.register_blueprint(views_bp)
    
    atexit.register(close_all_db_connections)
    
    return app
