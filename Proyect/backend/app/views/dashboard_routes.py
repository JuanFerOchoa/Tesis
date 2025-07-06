# app/views/dashboard_routes.py
from flask import Blueprint, jsonify
from app.controllers.dashboard_controller import obtener_estadisticas_dashboard

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/datos', methods=['GET'])
def estadisticas_dashboard():
    datos = obtener_estadisticas_dashboard()
    return jsonify(datos)
