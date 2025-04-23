from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

assign_pilot_bp = Blueprint('assign_pilot', __name__)

@assign_pilot_bp.route('/procedures/assign_pilot', methods=['POST'])
def assign_pilot():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        
        flightID = data.get("flightid")
        personID = data.get("personid")
        
        print(flightID, personID)
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call assign_pilot(%s, %s);",
            (flightID, personID)
        )
        
        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Pilot assigned"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)