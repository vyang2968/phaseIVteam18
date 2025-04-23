from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

passenger_bp = Blueprint('passenger', __name__)

# Get all passengers
@passenger_bp.route('/passengers', methods=['GET'])
def get_passengers():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM passenger")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one passenger
@passenger_bp.route('/passengers/<string:personid>', methods=['GET'])
def get_passenger(personID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM passenger WHERE personID = %s", (personID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Passenger not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create passenger
@passenger_bp.route('/passengers/<string:personid>', methods=['POST'])
def create_passenger(personid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        personID = data.get("personid")
        miles = data.get("miles")
        funds = data.get("funds")
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO passenger (personID, miles, funds)
            VALUES (%s, %s, %s)
            """,
            (personID, miles, funds)
        )
        connection.commit()
        return jsonify({"message": "Passenger created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete passenger
@passenger_bp.route('/passengers/<string:personID>', methods=['DELETE'])
def delete_passenger(personID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM passenger WHERE personID = %s", (personID, ))
        connection.commit()
        return jsonify({"message": "Passenger deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)