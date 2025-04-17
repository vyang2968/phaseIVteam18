from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2 import errors
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

general_bp = Blueprint('general', __name__)

@general_bp.route('/tables', methods=['GET'])
def get_tables():
    # attempts to connect to db server
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    # error safety
    try:
        # Use RealDictCursor to get results as dictionaries
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
          """
          SELECT tablename
          FROM pg_catalog.pg_tables
          WHERE schemaname != 'pg_catalog' AND
          schemaname != 'information_schema';
          """
        )
        
        tables = cursor.fetchall()

        # Convert rows to list of dicts for JSON serialization
        result = [dict(airplane) for airplane in tables]

        # status 200 means good
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Return connection to the pool
        release_db_connection(connection)