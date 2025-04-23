from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

person_bp = Blueprint('person', __name__)

# Get all persons
@person_bp.route('/persons', methods=['GET'])
def get_persons():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM person")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one person
@person_bp.route('/persons/<string:personID>', methods=['GET'])
def get_person(personID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM person WHERE personID = %s", (personID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Person not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create person
@person_bp.route('/persons/<string:personid>', methods=['POST'])
def create_person(personid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        personID = data.get("personid")
        print(personID)
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        locationID = data.get("locationid")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO person (personID, first_name, last_name, locationID)
            VALUES (%s, %s, %s, %s)
            """,
            (personID, first_name, last_name, locationID)
        )
        connection.commit()
        return jsonify({"message": "Person created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete person
@person_bp.route('/persons/<string:personid>', methods=['DELETE'])
def delete_person(personid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:

        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM person WHERE personID = %s", (personid, ))
        connection.commit()
        return jsonify({"message": "Person deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)