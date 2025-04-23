from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

offer_flight_bp = Blueprint('offer_flight', __name__)

@offer_flight_bp.route('/procedures/offer_flight', methods=['POST'])
def offer_flight():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        
        data = request.get_json()
        flightID = data.get("flightid")
        routeID = data.get("routeid")
        support_airline = data.get("support_airline")
        support_tail = data.get("support_tail")
        progress = data.get("progress")
        next_time = data.get("next_time")
        cost = data.get("cost")
        
        cursor.execute(
            "call offer_flight(%s, %s, %s, %s, %s, %s, %s);",
            (flightID, routeID, support_airline, support_tail, progress, next_time, cost)
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Flight offered success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)