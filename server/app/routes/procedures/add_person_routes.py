from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

add_person_bp = Blueprint('add_person', __name__)

@add_person_bp.route('/add_person', methods=['POST'])
def add_person(personID, first_name, last_name, locationID, taxID, experience, miles, funds):
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "call add_person(%s, %s, %s, %s, %s, %s, %s, %s);",
            (personID, first_name, last_name, locationID, taxID, experience, miles, funds)
            )

        connection.commit() # Needed because the database is being updated
        return jsonify({"message": "Person added"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)