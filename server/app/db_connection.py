# db_connection.py
import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling

# Load environment variables from .env file
load_dotenv()

class DBConnection:
    _instance = None
    _connection_pool = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DBConnection, cls).__new__(cls)
            cls._create_connection_pool()
        return cls._instance

    @classmethod
    def _create_connection_pool(cls):
        try:
            cls._connection_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="mysql_pool",
                pool_size=5,
                host=os.getenv('MYSQL_HOST', 'localhost'),
                user=os.getenv('MYSQL_USER', 'root'),
                password=os.getenv('MYSQL_PASSWORD', ''),
                database=os.getenv('MYSQL_DATABASE', 'mydatabase'),
                port=os.getenv('MYSQL_PORT', '3306')
            )
            print("Connection pool established")
        except Exception as e:
            print(f"Error creating connection pool: {e}")
            cls._connection_pool = None

    def get_connection(self):
        if self._connection_pool:
            try:
                return self._connection_pool.get_connection()
            except Exception as e:
                print(f"Error getting connection from pool: {e}")
        else:
            print("Connection pool not initialized")
        return None

    def release_connection(self, connection):
        if connection:
            connection.close()

    def close_all_connections(self):
        self._connection_pool = None
        print("All database connections closed")


# Singleton instance
db_connection = DBConnection()

def get_db_connection():
    return db_connection.get_connection()

def release_db_connection(connection):
    db_connection.release_connection(connection)

def close_all_db_connections():
    db_connection.close_all_connections()
