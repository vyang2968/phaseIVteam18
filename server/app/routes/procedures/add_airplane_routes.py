from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

add_airplane_bp = Blueprint('add_airplane', __name__)

@add_airplane_bp.route('/add_airplane', methods=['POST'])
def add_airplane(airlineID, tail_num, seat_capacity, speed, locationID, plane_type, maintenanced, model, neo):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call add_airplane(%s, %s, %s, %s, %s, %s, %s, %s, %s);",
            (airlineID, tail_num, seat_capacity, speed, locationID, plane_type, maintenanced, model, neo)
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Airplane added"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)