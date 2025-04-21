from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

# Get all passenger_vacationss
@airline_bp.route('/passenger_vacationss', methods=['GET'])
def get_passenger_vacationss():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM passenger_vacations")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one passenger_vacations
@airline_bp.route('/passenger_vacationss/<string:personID>/<string:airportID>', methods=['GET'])
def get_passenger_vacations(personID, airportID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM passenger_vacations WHERE personID = %s AND airportID = %s", (personID, airportID))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Passenger_vacations not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Create passenger_vacations
@airline_bp.route('/passenger_vacationss/<string:personID>/<string:airportID>', methods=['POST'])
def create_passenger_vacations(personID, airportID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        personID = data.get("personID")
        airportID = data.get("airportID")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO passenger_vacations (personID, airportID, sequence)
            VALUES (%s, %s, %s)
            """,
            (personID, airportID, sequence)
        )
        connection.commit()
        return jsonify({"message": "Passenger_vacations created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete passenger_vacations
@airline_bp.route('/passenger_vacations/<string:personID>/<string:airportID>', methods=['DELETE'])
def delete_passenger_vacations(personID, airportID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM passenger_vacations WHERE personID = %s AND airportID = %s", (personID, airportID))
        connection.commit()
        return jsonify({"message": "Passenger_vacations deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)