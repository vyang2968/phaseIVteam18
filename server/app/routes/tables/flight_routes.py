from datetime import timedelta
from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection
from app.utlis import format_timedelta

flight_bp = Blueprint('flight', __name__)

# Get all flights
@flight_bp.route('/flights', methods=['GET'])
def get_flights():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM flight")
        flights = cursor.fetchall()
        
        result = []
        for flight in flights:
            flight_dict = dict(flight)
            if 'next_time' in flight_dict and isinstance(flight_dict['next_time'], timedelta):
                flight_dict['next_time'] = format_timedelta(
                    flight_dict['next_time'])
            result.append(flight_dict)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one flight
@flight_bp.route('/flights/<string:flightID>', methods=['GET'])
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
@flight_bp.route('/flights/<string:flightid>', methods=['POST'])
def create_flight(flightid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        flightID = data.get("flightid")
        routeID = data.get("routeid")
        support_airline = data.get("support_airline")
        support_tail = data.get("support_tail")
        progress = data.get("progress")
        airplane_status = data.get("airplane_status")
        next_time = data.get("next_time")
        cost = data.get("cost")
        
        
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
@flight_bp.route('/flights/<string:flightid>', methods=['DELETE'])
def delete_flight(flightid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM flight WHERE flightID = %s", (flightid, ))
        connection.commit()
        return jsonify({"message": "Flight deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
        
# Update flight
@flight_bp.route('/flights/<string:flightid>', methods=['PATCH'])
def update_flight(flightid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        flightID = data.get("flightid")
        routeID = data.get("routeid")
        support_airline = data.get("support_airline")
        support_tail = data.get("support_tail")
        progress = data.get("progress")
        airplane_status = data.get("airplane_status")
        next_time = data.get("next_time")
        cost = data.get("cost")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            UPDATE flight
            SET routeID = %s, support_airline = %s, support_tail = %s, progress = %s, airplane_status = %s, next_time = %s, cost = %s
            WHERE flightID = %s
            """,
            (routeID, support_airline, support_tail, progress, airplane_status, next_time, cost, flightID)
        )
        connection.commit()
        return jsonify({"message": "Flight updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

