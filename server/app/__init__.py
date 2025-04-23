from flask import Flask
from app.db_connection import close_all_db_connections
import atexit
from app.routes.general_routes import general_bp
from app.routes.views.views_routes import views_bp
from flask_cors import CORS

# Procedure Imports
from app.routes.procedures.add_airplane_routes import add_airplane_bp
from app.routes.procedures.add_airport_routes import add_airport_bp
from app.routes.procedures.add_person_routes import add_person_bp
from app.routes.procedures.assign_pilot_routes import assign_pilot_bp
from app.routes.procedures.flight_landing_routes import flight_landing_bp
from app.routes.procedures.flight_takeoff_routes import flight_takeoff_bp
from app.routes.procedures.grant_or_revoke_pilot_license_routes import grant_or_revoke_pilot_license_bp
from app.routes.procedures.offer_flight_routes import offer_flight_bp
from app.routes.procedures.passengers_board_routes import passengers_board_bp
from app.routes.procedures.passengers_disembark_routes import passengers_disembark_bp
from app.routes.procedures.recycle_crew_routes import recycle_crew_bp
from app.routes.procedures.retire_flight_routes import retire_flight_bp
from app.routes.procedures.simulation_cycle_routes import simulation_cycle_bp

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
    app.register_blueprint(airport_bp)
    app.register_blueprint(flight_bp)
    app.register_blueprint(leg_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(passenger_bp)
    app.register_blueprint(passenger_vacations_bp)
    app.register_blueprint(person_bp)
    app.register_blueprint(pilot_licenses_bp)
    app.register_blueprint(pilot_bp)
    app.register_blueprint(route_path_bp)
    app.register_blueprint(route_bp)
    
    app.register_blueprint(general_bp)
    app.register_blueprint(views_bp)
    
    app.register_blueprint(add_airplane_bp)
    app.register_blueprint(add_airport_bp)
    app.register_blueprint(add_person_bp)
    app.register_blueprint(assign_pilot_bp)
    app.register_blueprint(flight_landing_bp)
    app.register_blueprint(flight_takeoff_bp)
    app.register_blueprint(grant_or_revoke_pilot_license_bp)
    app.register_blueprint(offer_flight_bp)
    app.register_blueprint(passengers_board_bp)
    app.register_blueprint(passengers_disembark_bp)
    app.register_blueprint(recycle_crew_bp)
    app.register_blueprint(retire_flight_bp)
    app.register_blueprint(simulation_cycle_bp)
    
    atexit.register(close_all_db_connections)
    
    return app
