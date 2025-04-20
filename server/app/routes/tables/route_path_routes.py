from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

# Get all route_paths
@airline_bp.route('/route_paths', methods=['GET'])
def get_route_paths():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM route_path")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one route_path
@airline_bp.route('/route_paths/<string:routeID>/<string:legID>', methods=['GET'])
def get_route_path(routeID, legID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM route_path WHERE routeID = %s AND legID = %s", (routeID, legID))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Route_path not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

# Create route_path
@airline_bp.route('/route_paths/<string:routeID>/<string:legID>', methods=['POST'])
def create_route_path(routeID, legID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        routeID = data.get("routeID")
        legID = data.get("legID")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO route_path (routeID, legID, sequence)
            VALUES (%s, %s, %s)
            """,
            (routeID, legID, sequence)
        )
        connection.commit()
        return jsonify({"message": "Route_path created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete route_path
@airline_bp.route('/route_path/<string:routeID>/<string:legID>', methods=['DELETE'])
def delete_route_path(routeID, legID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM route_path WHERE routeID = %s AND legID = %s", (routeID, legID))
        connection.commit()
        return jsonify({"message": "Route_path deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)