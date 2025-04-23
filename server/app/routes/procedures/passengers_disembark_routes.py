from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

passengers_disembark_bp = Blueprint('passengers_disembark', __name__)

@passengers_disembark_bp.route('/procedures/passengers_disembark', methods=['POST'])
def passengers_disembark():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        data = request.get_json()
        flightID = data.get("flightid")
        cursor.execute(
            "call passengers_disembark(%s);",
            (flightID, )
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Passengers disembarked"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)