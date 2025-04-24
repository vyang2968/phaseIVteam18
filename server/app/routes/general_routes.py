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

        tables_only = [row[f"Tables_in_{'flight_tracking'}"] for row in rows]

        return jsonify(tables_only), 200
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

        views = [row[f"Tables_in_{'flight_tracking'}"] for row in rows]

        return jsonify(views), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)


@general_bp.route("/procedures", methods=["GET"])
def get_procedures():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor(dictionary=True)  # Return rows as dicts

        # MySQL query to get table names from current database
        cursor.execute(
            """
            SELECT 
                routine_name AS procedure_name
            FROM 
                information_schema.routines
            WHERE 
                routine_type = 'PROCEDURE'
                AND routine_schema = 'flight_tracking'
            """
        )

        procedures = cursor.fetchall()

        procedures_res = [
            procedure['procedure_name'] for procedure in procedures]

        return jsonify(procedures_res), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
