# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

db  = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class):
    """
    Fábrica de aplicación Flask.
    Recibe la clase de configuración (Config) y la aplica.
    """
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(config_class)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    # Registrar blueprints
    from app.views.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # Ruta de comprobación
    @app.route('/')
    def index():
        return 'API Flask (Auth) corriendo', 200

    return app
