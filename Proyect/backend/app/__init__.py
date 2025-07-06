# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_dance.contrib.google import make_google_blueprint
import os

from app.extensions import db, jwt, mail 


def create_app(config_class):

    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object(config_class)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # Registrar blueprints
    from app.views.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.views.usuario_routes import usuario_bp
    app.register_blueprint(usuario_bp, url_prefix='/usuario')

    from app.views.upload_routes import upload_bp
    app.register_blueprint(upload_bp)

    from app.views.datos_routes import finanzas_bp
    app.register_blueprint(finanzas_bp)

    from app.views.finanzas_routes import estadisticas_bp
    app.register_blueprint(estadisticas_bp)
    
    from app.views.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp)

    from app.views.notificaciones_routes import notificaciones_bp
    app.register_blueprint(notificaciones_bp)


    app.secret_key = os.environ.get("SECRET_KEY", "dev-secret")

    # Google OAuth
    google_bp = make_google_blueprint(
        client_id=os.environ.get("GOOGLE_OAUTH_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET"),
        scope=["profile", "email"],
        redirect_to="auth.google_login_callback" 
    )
    app.register_blueprint(google_bp, url_prefix="/login")

    # Recuperación de Contraseña
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'soporte.auditoriacc@gmail.com'
    app.config['MAIL_PASSWORD'] = 'hqou ykts olqn wvit'
    app.config['MAIL_DEFAULT_SENDER'] = 'tucorreo@gmail.com'

    mail.init_app(app)

    

    # Ruta de comprobación
    @app.route('/')
    @app.route('/usuario/')
    def index():
        return 'API Flask (Auth) corriendo', 200

    return app