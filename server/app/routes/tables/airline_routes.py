from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

airline_bp = Blueprint('airline', __name__)

# Get all airlines
@airline_bp.route('/airlines', methods=['GET'])
def get_airlines():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM airline")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Get one airline
@airline_bp.route('/airlines/<string:airlineid>', methods=['GET'])
def get_airline(airlineid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM airline WHERE airlineid = %s", (airlineid,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Airline not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Create airline
@airline_bp.route('/airlines/<string:airlineid>', methods=['POST'])
def create_airline(airlineid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        airlineId = data.get("airlineid")
        revenue = data.get("revenue")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO airline (airlineid, revenue)
            VALUES (%s, %s)
            """,
            (airlineId, revenue)
        )
        connection.commit()
        return jsonify({"message": "Airline created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Delete airline
@airline_bp.route('/airlines/<string:airlineid>', methods=['DELETE'])
def delete_airline(airlineid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM airline WHERE airlineid = %s", (airlineid,))
        connection.commit()
        return jsonify({"message": "Airline deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Update airline
@airline_bp.route('/airlines/<string:airlineid>', methods=['PATCH'])
def update_airline(airlineid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        revenue = data.get("revenue")
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            UPDATE airline
            SET revenue = %s
            WHERE airlineID = %s
            """,
            (revenue, airlineid)
        )
        connection.commit()
        return jsonify({"message": "Airline updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)