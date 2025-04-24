from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

airport_bp = Blueprint('airport', __name__)

# Get all airports
@airport_bp.route('/airports', methods=['GET'])
def get_airlines():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM airport")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Get one airport
@airport_bp.route('/airports/<string:airportID>', methods=['GET'])
def get_airline(airportID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM airport WHERE airportID = %s", (airportID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Airport not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Create airport
# INSERT INTO airport (airportID, airport_name, city, state, country, locationID) VALUES
@airport_bp.route('/airports/<string:airportid>', methods=['POST'])
def create_airline(airportid):
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
            """
            INSERT INTO airport (airportID, airport_name, city, state, country, locationID)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (airportID, airport_name, city, state, country, locationID)
        )
        connection.commit()
        return jsonify({"message": "Airport created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Delete airport
@airport_bp.route('/airports/<string:airportid>', methods=['DELETE'])
def delete_airline(airportid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM airport WHERE airportID = %s", (airportid,))
        connection.commit()
        return jsonify({"message": "Airport deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

@airport_bp.route('/airports/<string:airportid>', methods=['PATCH'])
def update_airline(airportid):
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
            """
            UPDATE airport
            SET airport_name = %s, city = %s, state = %s, country = %s, locationID = %s
            WHERE airportId = %s
            """,
            (airport_name, city, state, country, locationID, airportID,)
        )
        connection.commit()
        return jsonify({"message": "Airport updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)