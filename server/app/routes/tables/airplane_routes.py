from flask import Blueprint, jsonify, request
import psycopg2
from psycopg2 import errors
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection

airplane_bp = Blueprint('airplane', __name__)

# example: http://127.0.0.1:5000/airplane/all


@airplane_bp.route('/airplanes', methods=['GET'])
def get_airplanes():
    # attempts to connect to db server
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    # error safety
    try:
        # Use RealDictCursor to get results as dictionaries
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM airplane")
        airplanes = cursor.fetchall()

        # Convert rows to list of dicts for JSON serialization
        result = [dict(airplane) for airplane in airplanes]

        # status 200 means good
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Return connection to the pool
        release_db_connection(connection)

# example: http://127.0.0.1:5000/airplane?airlineid=Air_France&tail_num=n118fm
# type into link area and press enter (given that your server is running)


@airplane_bp.route('/airplanes/<string:airlineid>/<string:tail_num>', methods=['GET']) # get means get
def get_airplane(airlineid, tail_num):
    # attempts to connect to db server
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    # error safety
    try:
        # Grab arguments in the link, notice how arguments match what's in the link
        # airlineID = request.args.get("airlineid")
        # tail_num = request.args.get("tail_num")

        # Use RealDictCursor to get results as dictionaries
        cursor = connection.cursor(dictionary=True)

        # here we're prone to something called SQL injection where someone can pass in a SQL command as an argument e.g. airlineID
        # cursor.execute(
        #     f"""
        #         SELECT * 
        #         FROM airplane
        #         WHERE airlineid = '{airlineID}' and tail_num = '{tail_num}'
        #     """
        # )

        # and they can do something like destroy our database
        
        # here's a good way to do it which parameterizes the variables so it's checked/processed first
        # arguments go in order you put them in
        cursor.execute(
            """
                SELECT *
                FROM airplane
                WHERE airlineid = %s AND tail_num = %s
            """,
            (airlineid, tail_num)
        )

        # since we only expect one airplane, we use fetchone()
        airplane = cursor.fetchone()

        # convert airplane to dictionary
        result = dict(airplane)

        # status 200 means good, worked, ok
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Return connection to the pool
        release_db_connection(connection)


@airplane_bp.route('/airplanes/<string:airlineid>/<string:tail_num>', methods=['POST']) # post means action (general)
def create_airplane(airlineid, tail_num):
    # attempts to connect to db server
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    # error safety
    try:
        # json is a way of structuring info into key value pairs
        data = request.get_json()
        
        # grab arguments
        airlineID = data.get("airlineid")
        tail_num = data.get("tail_num")
        seat_capacity = data.get("seat_capacity")
        speed = data.get("speed")
        locationID = data.get("locationid")
        plane_type = data.get("plane_type")
        maintenanced = data.get("maintenanced")
        model = data.get("model")
        neo = data.get("neo")
        
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute(
            """
                INSERT INTO airplane
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (airlineID, tail_num, seat_capacity, speed, locationID, plane_type, maintenanced, model, neo)
        )
        # %s means string
        
        # for actions like insert, create, delete, etc., we need to commit our changes
        connection.commit()
        
        # status 200 means good
        return jsonify({"message": "Airplane created successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Return connection to the pool
        release_db_connection(connection)

@airplane_bp.route('/airplanes/<string:airlineid>/<string:tail_num>', methods=['DELETE']) # delete means delete
def delete_airplane(airlineid, tail_num):
    # attempts to connect to db server
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500

    # error safety
    try:
        cursor = connection.cursor(dictionary=True)
        print(airlineid, tail_num)
        
        cursor.execute(
            """
                DELETE FROM airplane
                WHERE airlineid = %s and tail_num = %s
            """,
            (airlineid, tail_num)
        )
        
        # for actions like insert, create, delete, etc., we need to commit our changes
        connection.commit()
        
        # status 200 means good
        return jsonify({"message": "Airplane deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Return connection to the pool
        release_db_connection(connection)