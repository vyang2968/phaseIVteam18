from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

recycle_crew_bp = Blueprint('recycle_crew', __name__)

@recycle_crew_bp.route('/procedures/recycle_crew', methods=['POST'])
def recycle_crew():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        data = request.get_json()
        flightID = data.get("flightid")
        cursor.execute(
            "call recycle_crew(%s);",
            (flightID, )
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Crew recycled"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)