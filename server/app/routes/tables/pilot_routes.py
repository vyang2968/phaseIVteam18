from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

pilot_bp = Blueprint('pilot', __name__)

# Get all pilots
@pilot_bp.route('/pilots', methods=['GET'])
def get_pilots():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pilot")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one pilot
@pilot_bp.route('/pilots/<string:personID>', methods=['GET'])
def get_pilot(personID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pilot WHERE personID = %s", (personID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Pilot not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create pilot
@pilot_bp.route('/pilots/<string:personID>', methods=['POST'])
def create_pilot(personID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        personID = data.get("personID")
        taxID = data.get("taxID")
        experience = data.get("experience")
        commanding_flight = data.get("commanding_flight")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO pilot (personID, taxID, experience, commanding_flight)
            VALUES (%s, %s, %s, %s)
            """,
            (personID, taxID, experience, commanding_flight)
        )
        connection.commit()
        return jsonify({"message": "Pilot created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete pilot
@pilot_bp.route('/pilot/<string:personID>', methods=['DELETE'])
def delete_pilot(personID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM pilot WHERE personID = %s", (personID))
        connection.commit()
        return jsonify({"message": "Pilot deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
