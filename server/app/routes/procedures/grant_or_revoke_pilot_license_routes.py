from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

grant_or_revoke_pilot_license_bp = Blueprint('grant_or_revoke_pilot_license', __name__)

@grant_or_revoke_pilot_license_bp.route('/procedures/grant_or_revoke_pilot_license', methods=['POST'])
def grant_or_revoke_pilot_license():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        data = request.get_json()
        personID = data.get("personid")
        license = data.get("license")
        cursor.execute(
            "call grant_or_revoke_pilot_license(%s, %s);",
            (personID, license)
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Pilot license change successful"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)