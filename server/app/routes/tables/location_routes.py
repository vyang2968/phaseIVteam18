from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

# Get all locations
@airline_bp.route('/locations', methods=['GET'])
def get_locations():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM location")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one location
@airline_bp.route('/locations/<string:locationID>', methods=['GET'])
def get_location(locationID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM location WHERE locationID = %s", (locationID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Location not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create location
@airline_bp.route('/locations/<string:locationID>', methods=['POST'])
def create_location(locationID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        locationID = data.get("locationID")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO location (locationID)
            VALUES (%s)
            """,
            (locationID)
        )
        connection.commit()
        return jsonify({"message": "Location created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete location
@airline_bp.route('/location/<string:locationID>', methods=['DELETE'])
def delete_location(locationID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM location WHERE locationID = %s", (locationID))
        connection.commit()
        return jsonify({"message": "Location deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
