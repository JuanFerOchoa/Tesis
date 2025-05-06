# backend/app/views/auth_routes.py
from flask import Blueprint
from app.controllers.auth_controller import register, login, me

auth_bp = Blueprint('auth', __name__)
auth_bp.add_url_rule('/register', 'register', register, methods=['POST'])
auth_bp.add_url_rule('/login',    'login',    login,    methods=['POST'])
auth_bp.add_url_rule('/me',       'me',       me,       methods=['GET'])
