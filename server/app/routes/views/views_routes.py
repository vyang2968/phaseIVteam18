from datetime import timedelta
from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from app.db_connection import get_db_connection, release_db_connection
from app.utlis import format_timedelta

views_bp = Blueprint('views', __name__)


@views_bp.route('/views/alternative_airports', methods=['GET'])
def get_alternative_airports():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM alternative_airports")

        airports = cursor.fetchall()

        result = [dict(airport) for airport in airports]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)


@views_bp.route('/views/flights_in_the_air', methods=['GET'])
def get_flights_in_the_air():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
      cursor = connection.cursor(dictionary=True)
      cursor.execute("SELECT * FROM flights_in_the_air")
      flights = cursor.fetchall()
      
      result = []

      for flight in flights:
        flight_dict = dict(flight)
        if 'earliest_arrival' in flight_dict and isinstance(flight_dict['earliest_arrival'], timedelta):
            flight_dict['earliest_arrival'] = format_timedelta(
                flight_dict['earliest_arrival'])
        if 'latest_arrival' in flight_dict and isinstance(flight_dict['latest_arrival'], timedelta):
            flight_dict['latest_arrival'] = format_timedelta(
                flight_dict['latest_arrival'])
        result.append(flight_dict)
      return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)


@views_bp.route('/views/flights_on_the_ground', methods=['GET'])
def get_flights_on_the_ground():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM flights_on_the_ground")
        flights = cursor.fetchall()
        result = []

        for flight in flights:
          flight_dict = dict(flight)
          if 'earliest_arrival' in flight_dict and isinstance(flight_dict['earliest_arrival'], timedelta):
              flight_dict['earliest_arrival'] = format_timedelta(
                  flight_dict['earliest_arrival'])
          if 'latest_arrival' in flight_dict and isinstance(flight_dict['latest_arrival'], timedelta):
              flight_dict['latest_arrival'] = format_timedelta(
                  flight_dict['latest_arrival'])
          result.append(flight_dict)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)


@views_bp.route('/views/people_in_the_air', methods=['GET'])
def get_people_in_the_air():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM people_in_the_air")
        people = cursor.fetchall()
        
        result = []

        for person in people:
          person_dict = dict(person)
          # Convert timedelta objects to formatted strings
          if 'earliest_arrival' in person_dict and isinstance(person_dict['earliest_arrival'], timedelta):
              person_dict['earliest_arrival'] = format_timedelta(
                  person_dict['earliest_arrival'])
          if 'latest_arrival' in person_dict and isinstance(person_dict['latest_arrival'], timedelta):
              person_dict['latest_arrival'] = format_timedelta(
                  person_dict['latest_arrival'])
          result.append(person_dict)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)


@views_bp.route('/views/people_on_the_ground', methods=['GET'])
def get_people_on_the_ground():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM people_on_the_ground")
        people = cursor.fetchall()
        
        result = [dict(person) for person in people]
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)


@views_bp.route('/views/route_summary', methods=['GET'])
def get_route_summary():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM route_summary")
        routes = cursor.fetchall()

        result = [dict(route) for route in routes]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_db_connection(connection)
