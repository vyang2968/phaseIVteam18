from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

add_airport_bp = Blueprint('add_airport', __name__)

@add_airport_bp.route('/procedures/add_airport', methods=['POST'])
def add_airport():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        airportID = data.get("airportid")
        airport_name = data.get("airport_name")
        city = data.get("city")
        state = data.get("state")
        country = data.get("country")
        locationID = data.get("locationid")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call add_airport(%s, %s, %s, %s, %s, %s);",
            (airportID, airport_name, city, state, country, locationID)
            )
        
        if cursor.rowcount < 1:
            return jsonify({"error": "No rows affected"}), 500
        
        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Airport added"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)