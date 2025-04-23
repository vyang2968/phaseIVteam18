from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

route_bp = Blueprint('route', __name__)

# Get all routes
@route_bp.route('/routes', methods=['GET'])
def get_routes():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM route")
        result = cursor.fetchall()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
          release_db_connection(connection)

# Get one route
@route_bp.route('/routes/<string:routeID>', methods=['GET'])
def get_route(routeID):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM route WHERE routeID = %s", (routeID,))
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Route not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  
# Create route
@route_bp.route('/routes/<string:routeid>', methods=['POST'])
def create_route(routeid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.get_json()
        routeID = data.get("routeid")

        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO route (routeID)
            VALUES (%s)
            """,
            (routeID, )
        )
        connection.commit()
        return jsonify({"message": "Route created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
  

# Delete route
@route_bp.route('/routes/<string:routeid>', methods=['DELETE'])
def delete_route(routeid):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("DELETE FROM route WHERE routeID = %s", (routeid, ))
        connection.commit()
        return jsonify({"message": "Route deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
