from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

flight_takeoff_bp = Blueprint('flight_takeoff', __name__)

@flight_takeoff_bp.route('/procedures/flight_takeoff', methods=['POST'])
def flight_takeoff():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        data = request.get_json()
        flightID = data.get("flightid")
        cursor.execute(
            "call flight_takeoff(%s);",
            (flightID,)
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Flight takeoff successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)