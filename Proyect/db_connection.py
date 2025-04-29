import psycopg2

# Datos de conexión actualizados
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "db_finance"
DB_USER = "postgres"
DB_PASSWORD = "root2003"

def create_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        print("Conexión exitosa a PostgreSQL")
        return conn
    except Exception as e:
        print(f"Error de conexión: {e}")
        return None

# Para probar la conexión directamente
if __name__ == "__main__":
    connection = create_connection()
    if connection:
        connection.close()
