from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

leg_bp = Blueprint('leg', __name__)

# Get all legs
@leg_bp.route('/legs', methods=['GET'])
def get_legs():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM leg")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one leg
@leg_bp.route('/legs/<string:legID>', methods=['GET'])
def get_leg(legID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM leg WHERE legID = %s", (legID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Leg not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create leg
@leg_bp.route('/legs/<string:legID>', methods=['POST'])
def create_leg(legID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        legID = data.get("legID")
        departure = data.get("departure")
        arrival = data.get("arrival")
        distance = data.get(distance)
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO leg (legID, departure, arrival, distance)
            VALUES (%s, %s, %s, %s)
            """,
            (legID, departure, arrival, distance)
        )
        connection.commit()
        return jsonify({"message": "Leg created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete leg
@leg_bp.route('/leg/<string:legID>', methods=['DELETE'])
def delete_leg(legID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM leg WHERE legID = %s", (legID))
        connection.commit()
        return jsonify({"message": "Leg deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
