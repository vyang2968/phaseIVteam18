from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

simulation_cycle_bp = Blueprint('simulation_cycle', __name__)

@simulation_cycle_bp.route('/simulation_cycle', methods=['POST'])
def simulation_cycle():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call simulation_cycle();"
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Simulation cycle success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)