from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

passengers_board_bp = Blueprint('passengers_board', __name__)

@passengers_board_bp.route('/procedures/passengers_board', methods=['POST'])
def passengers_board():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        data = request.get_json()
        flightID = data.get("flightid")
        cursor.execute(
            "call passengers_board(%s);",
            (flightID, )
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Passengers boarded"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)