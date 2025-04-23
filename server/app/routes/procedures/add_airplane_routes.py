from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

add_airplane_bp = Blueprint('add_airplane', __name__)

@add_airplane_bp.route('/procedures/add_airplane', methods=['POST'])
def add_airplane():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        
        airlineID = data.get("airlineid")
        tail_num = data.get("tail_num")
        seat_capacity = data.get("seat_capacity")
        speed = data.get("speed")
        locationID = data.get("locationid")
        plane_type = data.get("plane_type")
        maintenanced = data.get("maintenanced")
        model = data.get("model")
        neo = data.get("neo")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call add_airplane(%s, %s, %s, %s, %s, %s, %s, %s, %s);",
            (airlineID, tail_num, seat_capacity, speed, locationID, plane_type, maintenanced, model, neo)
            )

        if cursor.rowcount < 1:
            return jsonify({"error": "No rows affected"}), 500
        
        connection.commit() # Needed because the database is being updated
        
        return jsonify({"message": "Airplane added"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)