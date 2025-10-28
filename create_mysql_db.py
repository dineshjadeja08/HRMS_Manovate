"""Create MySQL database for HRMS"""
import pymysql
import sys

# MySQL connection settings - adjust these if needed
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "root"  # Update this with your MySQL password if you have one
MYSQL_DATABASE = "hrms_db"

def create_database():
    """Create the MySQL database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        print(f"Connected to MySQL server at {MYSQL_HOST}")
        
        with connection.cursor() as cursor:
            # Create database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✓ Database '{MYSQL_DATABASE}' created successfully!")
            
            # Show databases
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            print("\nAvailable databases:")
            for db in databases:
                print(f"  - {db['Database']}")
        
        connection.close()
        print(f"\n✓ You can now run: python seed_db.py")
        
    except pymysql.Error as e:
        print(f"Error connecting to MySQL: {e}")
        print("\nPlease check:")
        print("1. MySQL is running")
        print("2. MySQL credentials are correct (update MYSQL_PASSWORD in this script if needed)")
        print("3. MySQL port 3306 is accessible")
        sys.exit(1)

if __name__ == "__main__":
    create_database()
