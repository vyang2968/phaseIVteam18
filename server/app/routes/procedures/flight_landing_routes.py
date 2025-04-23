from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

flight_landing_bp = Blueprint('flight_landing', __name__)

@flight_landing_bp.route('/procedures/flight_landing', methods=['POST'])
def flight_landing():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        flightID = data.get("flightid")
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call flight_landing(%s);",
            (flightID, )
        )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Flight landed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)