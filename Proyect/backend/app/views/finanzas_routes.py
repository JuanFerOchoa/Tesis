# /views/finanzas_routes.py
from flask import Blueprint, jsonify, request
from app.models import CargaFinanciera
from app.controllers.finanzas_controller import (
    obtener_datos_financieros,
    analisis_vertical,
    analisis_horizontal,
    calcular_indicadores,
    analizar_fraude_por_carga
)

estadisticas_bp = Blueprint('estadisticas', __name__)

@estadisticas_bp.route('/estadisticas/indicadores/<int:carga_id>')
def ruta_indicadores(carga_id):
    es_dict, er_dict = obtener_datos_financieros(carga_id)
    indicadores = calcular_indicadores(es_dict, er_dict)
    return jsonify(indicadores)

@estadisticas_bp.route('/estadisticas/vertical/<int:carga_id>')
def ruta_vertical(carga_id):
    es_dict, er_dict = obtener_datos_financieros(carga_id)
    vertical_balance, vertical_resultados = analisis_vertical(es_dict, er_dict)
    return jsonify({
        'vertical_balance': vertical_balance,
        'vertical_resultados': vertical_resultados
    })

@estadisticas_bp.route('/estadisticas/horizontal', methods=['GET'])
def ruta_horizontal():
    actual_id = request.args.get('actual')
    anterior_id = request.args.get('anterior')

    if not actual_id or not anterior_id:
        return jsonify({'error': 'Se requieren los parámetros actual y anterior'}), 400

    carga_actual = CargaFinanciera.query.filter_by(carga_id=actual_id).first()
    carga_anterior = CargaFinanciera.query.filter_by(carga_id=anterior_id).first()

    if not carga_actual or not carga_anterior:
        return jsonify({'error': 'Uno o ambos periodos no existen'}), 404

    # Validar que sean de la misma empresa
    if carga_actual.empresa_id != carga_anterior.empresa_id:
        return jsonify({'error': 'Los periodos deben ser de la misma empresa'}), 400

    # Validar que las fechas no sean iguales (comparar solo fecha, no hora)
    if carga_actual.fecha_carga.date() == carga_anterior.fecha_carga.date():
        return jsonify({'error': 'Los periodos deben tener fechas de carga diferentes'}), 400

    # Obtener datos financieros
    es_actual, er_actual = obtener_datos_financieros(carga_actual.carga_id)
    es_anterior, er_anterior = obtener_datos_financieros(carga_anterior.carga_id)

    # Realizar análisis horizontal
    horizontal_balance, horizontal_resultados = analisis_horizontal(es_actual, es_anterior, er_actual, er_anterior)

    return jsonify({
        'horizontal_balance': horizontal_balance,
        'horizontal_resultados': horizontal_resultados
    })

@estadisticas_bp.route('/api/finanzas/comparar/<int:empresa_id>', methods=['GET'])
def comparar_periodos(empresa_id):
    periodo1_id = request.args.get('periodo1')
    periodo2_id = request.args.get('periodo2')

    if not periodo1_id or not periodo2_id:
        return jsonify({'error': 'Se requieren los parámetros periodo1 y periodo2'}), 400

    carga1 = CargaFinanciera.query.filter_by(carga_id=periodo1_id, empresa_id=empresa_id).first()
    carga2 = CargaFinanciera.query.filter_by(carga_id=periodo2_id, empresa_id=empresa_id).first()

    if not carga1 or not carga2:
        return jsonify({'error': 'Uno o ambos períodos no existen para esta empresa'}), 404

    # Extraer nombre base del archivo quitando el prefijo de fecha
    nombre_base_1 = "_".join(carga1.nombre_archivo.split("_")[1:])
    nombre_base_2 = "_".join(carga2.nombre_archivo.split("_")[1:])

    if nombre_base_1 != nombre_base_2:
        return jsonify({'error': 'Los archivos base no coinciden, deben ser del mismo origen'}), 400

    # Comparar solo la fecha sin la hora para validar que no sean iguales
    if carga1.fecha_carga.date() == carga2.fecha_carga.date():
        return jsonify({'error': 'Las fechas de carga deben ser distintas para comparar períodos'}), 400

    # Ordenar: el más reciente como "actual", el más antiguo como "anterior"
    if carga1.fecha_carga > carga2.fecha_carga:
        actual, anterior = carga1, carga2
    else:
        actual, anterior = carga2, carga1

    es_actual, er_actual = obtener_datos_financieros(actual.carga_id)
    es_anterior, er_anterior = obtener_datos_financieros(anterior.carga_id)

    horizontal_balance, horizontal_resultados = analisis_horizontal(
        es_actual, es_anterior,
        er_actual, er_anterior
    )

    return jsonify({
        'empresa_id': empresa_id,
        'archivo_base': nombre_base_1,
        'periodo_actual': actual.fecha_carga.strftime('%Y-%m-%d'),
        'periodo_anterior': anterior.fecha_carga.strftime('%Y-%m-%d'),
        'analisis_horizontal_balance': horizontal_balance,
        'analisis_horizontal_resultados': horizontal_resultados
    }), 200


@estadisticas_bp.route("/analizar_fraude/<int:carga_id>", methods=["GET"])
def analizar_fraude(carga_id):
    resultado = analizar_fraude_por_carga(carga_id)
    return resultado


@estadisticas_bp.route('/cargas')
def listar_cargas():
    cargas = CargaFinanciera.query.all()
    return jsonify([{"id": c.carga_id, "archivo": c.nombre_archivo} for c in cargas])
