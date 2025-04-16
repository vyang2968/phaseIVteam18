# db_connection.py
import psycopg2
from psycopg2 import pool
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class DBConnection:
    _instance = None
    _connection_pool = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DBConnection, cls).__new__(cls)
            # Initialize the connection pool
            cls._create_connection_pool()
        return cls._instance
    
    @classmethod
    def _create_connection_pool(cls):
        """Create a connection pool for Neon PostgreSQL"""
        try:
            
            db_url = os.getenv('DATABASE_URL')
            
            cls._connection_pool = pool.SimpleConnectionPool(
                minconn=1,
                maxconn=5,
                dsn=db_url
            )
            print("Neon PostgreSQL connection pool established")
        except Exception as e:
            print(f"Error creating connection pool: {e}")
            cls._connection_pool = None
    
    def get_connection(self):
        """Get a connection from the pool"""
        if self._connection_pool:
            try:
                connection = self._connection_pool.getconn()
                return connection
            except Exception as e:
                print(f"Error getting connection from pool: {e}")
                return None
        else:
            print("Connection pool is not initialized")
            return None
    
    def release_connection(self, connection):
        """Return a connection to the pool"""
        if self._connection_pool and connection:
            self._connection_pool.putconn(connection)
    
    def close_all_connections(self):
        """Close all connections in the pool"""
        if self._connection_pool:
            self._connection_pool.closeall()
            print("All database connections closed")


# Create a singleton instance
db_connection = DBConnection()

# Function to easily get a connection from any file
def get_db_connection():
    return db_connection.get_connection()

# Function to release a connection back to the pool
def release_db_connection(connection):
    db_connection.release_connection(connection)

# Function to close all connections when needed
def close_all_db_connections():
    db_connection.close_all_connections()