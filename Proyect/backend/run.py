# run.py
from config import Config
from app import create_app, db

app = create_app(Config)

if __name__ == '__main__':
    # En modo desarrollo crea las tablas si faltan
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', debug=True)
