from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

passenger_vacations_bp = Blueprint('passenger_vacations', __name__)

# Get all passenger_vacationss
@passenger_vacations_bp.route('/passenger_vacations', methods=['GET'])
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
@passenger_vacations_bp.route('/passenger_vacations/<string:personID>/<string:airportID>', methods=['GET'])
def get_passenger_vacations(personID, airportID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM passenger_vacations WHERE personID = %s AND airportID = %s", (personID, airportID))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Passenger_vacations not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Create passenger_vacations
@passenger_vacations_bp.route('/passenger_vacations/<string:personID>/<string:airportID>', methods=['POST'])
def create_passenger_vacations(personID, airportID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        personID = data.get("personid")
        airportID = data.get("airportid")
        sequence = data.get("sequence")

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
@passenger_vacations_bp.route('/passenger_vacations/<string:personID>/<string:sequence>', methods=['DELETE'])
def delete_passenger_vacations(personID, sequence):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "DELETE FROM passenger_vacations WHERE personID = %s AND sequence = %s", (personID, sequence))
        connection.commit()
        return jsonify({"message": "Passenger_vacations deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Update passenger_vacations
@passenger_vacations_bp.route('/passenger_vacations/<string:personid>/<string:airportid>', methods=['PATCH'])
def update_passenger_vacations(personid, airportid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        sequence = data.get("sequence")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
        """
            UPDATE passenger_vacations
            SET sequence = %s
            WHERE personID  = %s AND airportID = %s
        """, 
        (sequence, personid, airportid))
        connection.commit()
        return jsonify({"message": "Passenger vacations updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
