from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

# Get all pilot_licensess
@airline_bp.route('/pilot_licensess', methods=['GET'])
def get_pilot_licensess():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pilot_licenses")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one pilot_licenses
@airline_bp.route('/pilot_licensess/<string:personID>/<string:license>', methods=['GET'])
def get_pilot_licenses(personID, license):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pilot_licenses WHERE personID = %s AND license = %s", (personID, license))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Pilot_licenses not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Create pilot_licenses
@airline_bp.route('/pilot_licensess/<string:personID>/<string:license>', methods=['POST'])
def create_pilot_licenses(personID, license):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        personID = data.get("personID")
        license = data.get("license")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO pilot_licenses (personID, license)
            VALUES (%s, %s)
            """,
            (personID, license)
        )
        connection.commit()
        return jsonify({"message": "Pilot_licenses created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete pilot_licenses
@airline_bp.route('/pilot_licenses/<string:personID>/<string:license>', methods=['DELETE'])
def delete_pilot_licenses(personID, license):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM pilot_licenses WHERE personID = %s AND license = %s", (personID, license))
        connection.commit()
        return jsonify({"message": "Pilot_licenses deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

  
