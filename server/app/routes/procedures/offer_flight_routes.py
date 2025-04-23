from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

offer_flight_bp = Blueprint('offer_flight', __name__)

@offer_flight_bp.route('/offer_flight', methods=['POST'])
def offer_flight(flightID, routeID, support_airline, support_tail, progress, next_time, cost):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
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