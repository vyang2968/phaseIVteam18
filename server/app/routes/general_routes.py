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
        cursor.execute("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
        
        rows = cursor.fetchall()
        
        #tables_only = [row[f'Tables_in_{'flight_tracking'}'] for row in rows]

        #return jsonify(tables_only), 200
        return rows
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

@general_bp.route('/views', methods=['GET'])
def get_views():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)  # Return rows as dicts


        # MySQL query to get table names from current database
        cursor.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'")
        
        rows = cursor.fetchall()
        
        #tables_only = [row[f'Tables_in_{'flight_tracking'}'] for row in rows]

        #return jsonify(tables_only), 200
        return rows
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)

