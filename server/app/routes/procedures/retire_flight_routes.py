from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

retire_flight_bp = Blueprint('retire_flight', __name__)

@retire_flight_bp.route('/procedures/retire_flight', methods=['POST'])
def retire_flight():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        data = request.get_json()
        flightID = data.get("flightid")
        cursor.execute(
            "call retire_flight(%s);",
            (flightID,)
        )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Flight retired"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)