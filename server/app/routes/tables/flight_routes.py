from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

# Get all flights
@airline_bp.route('/flights', methods=['GET'])
def get_flights():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM flight")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one flight
@airline_bp.route('/flights/<string:flightID>', methods=['GET'])
def get_flight(flightID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM flight WHERE flightID = %s", (flightID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Flight not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create flight
@airline_bp.route('/flights/<string:flightID>', methods=['POST'])
def create_flight(flightID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        flightID = data.get("flightID")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO flight (flightID, routeID, support_airline, support_tail, progress, airplane_status, next_time, cost)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (flightID, routeID, support_airline, support_tail, progress, airplane_status, next_time, cost)
        )
        connection.commit()
        return jsonify({"message": "Flight created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete flight
@airline_bp.route('/flight/<string:flightID>', methods=['DELETE'])
def delete_flight(flightID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM flight WHERE flightID = %s", (flightID))
        connection.commit()
        return jsonify({"message": "Flight deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

