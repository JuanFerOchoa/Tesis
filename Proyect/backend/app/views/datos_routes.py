# /views/datos_routes.py
from flask import Blueprint, jsonify
from app.models import CargaFinanciera, EstadoResultados, EstadoSituacion

finanzas_bp = Blueprint('finanzas', __name__)

@finanzas_bp.route('/carga/<int:carga_id>/datos', methods=['GET'])
def obtener_datos_carga(carga_id):
    estado_resultados = EstadoResultados.query.filter_by(carga_id=carga_id).all()
    estado_situacion = EstadoSituacion.query.filter_by(carga_id=carga_id).all()

    def serialize(fila):
        return {
            'codigo': fila.codigo,
            'cuenta': fila.cuenta,
            'rubro_economico': fila.rubro_economico
        }

    return jsonify({
        'estado_resultados': [serialize(r) for r in estado_resultados],
        'estado_situacion': [serialize(s) for s in estado_situacion]
    })
