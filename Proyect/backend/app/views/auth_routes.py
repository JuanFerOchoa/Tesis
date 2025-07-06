# backend/app/views/auth_routes.py
from flask import Blueprint
from app.controllers.auth_controller import register, login, me
from app.controllers.auth_controller import google_login_callback
from app.controllers.auth_controller import recuperar_password
from app.controllers.auth_controller import reset_password




auth_bp = Blueprint('auth', __name__)
auth_bp.add_url_rule('/register', 'register', register, methods=['POST'])
auth_bp.add_url_rule('/login',    'login',    login,    methods=['POST'])
auth_bp.add_url_rule('/me',       'me',       me,       methods=['GET'])
auth_bp.add_url_rule('/recuperar-password', 'recuperar_password', recuperar_password, methods=['POST'])
auth_bp.add_url_rule('/reset-password', 'reset_password', reset_password, methods=['POST'])



auth_bp.add_url_rule(
    '/login/google/authorized', 
    'google_login_callback', 
    google_login_callback
)
