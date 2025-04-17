from flask import Blueprint, jsonify, request
from app.db_connection import get_db_connection, release_db_connection

general_bp = Blueprint('general', __name__)

@general_bp.route('/tables', methods=['GET'])
def get_tables():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)  # Return rows as dicts

        # MySQL query to get table names from current database
        cursor.execute("SHOW TABLES")

        # Fetch all table rows
        rows = cursor.fetchall()

        # Each row is like: {'Tables_in_yourdatabase': 'tablename'}
        # So we extract the table name from each dict value
        tables = [list(row.values())[0] for row in rows]

        return jsonify(tables), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
