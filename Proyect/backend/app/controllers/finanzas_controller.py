# app/controllers/finanzas_controller.py

from flask import Blueprint
from app.extensions import db 
from app.models import EstadoSituacion, EstadoResultados, ResultadoFraude, CargaFinanciera, Notificacion
import joblib
import numpy as np
modelo_fraude = joblib.load("modelo_entrenado.pkl")

finanzas_bp = Blueprint('finanzas', __name__)

def obtener_datos_financieros(carga_id):
    estado_situacion = EstadoSituacion.query.filter_by(carga_id=carga_id).all()
    estado_resultados = EstadoResultados.query.filter_by(carga_id=carga_id).all()

    es_dict = {e.codigo: {'valor': e.rubro_economico, 'nombre': e.cuenta} for e in estado_situacion}
    er_dict = {e.codigo: {'valor': e.rubro_economico, 'nombre': e.cuenta} for e in estado_resultados}
    return es_dict, er_dict

def analisis_vertical(es_dict, er_dict):
    total_activos = es_dict.get('1', {}).get('valor', 0)
    total_ingresos = er_dict.get('4', {}).get('valor', 0)

    vertical_balance = {
        es_dict[codigo]['nombre']: (dato['valor'] / total_activos) * 100 if total_activos else None
        for codigo, dato in es_dict.items()
    }

    vertical_resultados = {
        er_dict[codigo]['nombre']: (dato['valor'] / total_ingresos) * 100 if total_ingresos else None
        for codigo, dato in er_dict.items()
    }

    return vertical_balance, vertical_resultados

def analisis_horizontal(es_dict1, es_dict2, er_dict1, er_dict2):
    all_codigos = set(es_dict1.keys()).union(es_dict2.keys())

    horizontal_balance = {}
    for codigo in all_codigos:
        valor1 = es_dict1.get(codigo, {}).get('valor', 0)
        valor2 = es_dict2.get(codigo, {}).get('valor', 0)
        nombre = es_dict1.get(codigo, {}).get('nombre') or es_dict2.get(codigo, {}).get('nombre')
        if valor2 != 0:
            variacion = ((valor1 - valor2) / valor2) * 100
        else:
            variacion = None
        horizontal_balance[nombre] = variacion

    all_codigos_er = set(er_dict1.keys()).union(er_dict2.keys())
    horizontal_resultados = {}
    for codigo in all_codigos_er:
        valor1 = er_dict1.get(codigo, {}).get('valor', 0)
        valor2 = er_dict2.get(codigo, {}).get('valor', 0)
        nombre = er_dict1.get(codigo, {}).get('nombre') or er_dict2.get(codigo, {}).get('nombre')
        if valor2 != 0:
            variacion = ((valor1 - valor2) / valor2) * 100
        else:
            variacion = None
        horizontal_resultados[nombre] = variacion

    return horizontal_balance, horizontal_resultados

def calcular_indicadores(es_dict, er_dict):
    def valor(cod):
        return es_dict.get(cod, {}).get('valor', 0)

    def valor_er(cod):
        return er_dict.get(cod, {}).get('valor', 0)

    activo_corriente = valor('1.1')
    pasivo_corriente = valor('2.1')
    inventario = valor('1.1.3')

    utilidad_neta = None
    ventas = valor_er('4')
    total_activos = valor('1')
    total_pasivos = valor('2')
    patrimonio = valor('3')

    # Intentar encontrar utilidad neta por nombre, no por código
    for codigo, data in er_dict.items():
        if 'utilidad neta' in data['nombre'].lower():
            utilidad_neta = data['valor']
            break
    if utilidad_neta is None:
        utilidad_neta = 0  # fallback

    indicadores = {
        'Liquidez Corriente': activo_corriente / pasivo_corriente if pasivo_corriente else None,
        'Prueba Ácida': (activo_corriente - inventario) / pasivo_corriente if pasivo_corriente else None,
        'Nivel de Endeudamiento': total_pasivos / total_activos if total_activos else None,
        'Margen Neto': utilidad_neta / ventas if ventas else None
        #'ROA (Retorno sobre Activos)': utilidad_neta / total_activos if total_activos else None,
        #'ROE (Retorno sobre Patrimonio)': utilidad_neta / patrimonio if patrimonio else None
    }

    return indicadores


def predecir_fraude(indicadores):
    valores = [
        indicadores['Liquidez Corriente'],
        indicadores['Prueba Ácida'],
        indicadores['Nivel de Endeudamiento'],
        indicadores['Margen Neto']
    ]

    prediccion = modelo_fraude.predict([valores])[0]
    probabilidad = modelo_fraude.predict_proba([valores])[0][1]  

    resultado = "FRAUDE" if prediccion == 1 else "NO FRAUDE"
    return resultado, prediccion == 1, float(probabilidad)


def analizar_fraude_por_carga(carga_id):

    resultado_existente = ResultadoFraude.query.filter_by(carga_id=carga_id).first()
    if resultado_existente:
        return {
            "indicadores": {
                "Liquidez Corriente": float(resultado_existente.liquidez_corriente),
                "Prueba Ácida": float(resultado_existente.prueba_acida),
                "Nivel de Endeudamiento": float(resultado_existente.nivel_endeudamiento),
                "Margen Neto": float(resultado_existente.margen_neto),
            },
            "resultado_fraude": resultado_existente.resultado_texto,
            "probabilidad": float(resultado_existente.probabilidad_fraude)
        }


    es_dict, er_dict = obtener_datos_financieros(carga_id)
    indicadores = calcular_indicadores(es_dict, er_dict)

    if None in indicadores.values():
        return {"error": "Faltan datos para calcular todos los indicadores."}

    resultado_texto, es_fraude, probabilidad = predecir_fraude(indicadores)

    carga = CargaFinanciera.query.get(carga_id)
    if not carga:
        return {"error": "Carga financiera no encontrada."}

 
    nuevo_resultado = ResultadoFraude(
        carga_id=carga_id,
        analizado_por=carga.usuario_id,
        es_fraude=es_fraude,
        probabilidad_fraude=probabilidad,
        resultado_texto=resultado_texto,
        liquidez_corriente=indicadores['Liquidez Corriente'],
        margen_neto=indicadores['Margen Neto'],
        nivel_endeudamiento=indicadores['Nivel de Endeudamiento'],
        prueba_acida=indicadores['Prueba Ácida']
    )
    db.session.add(nuevo_resultado)

    # Si se detecta fraude, crear una notificación
    if es_fraude:
        mensaje = f"⚠️ Se detectó un posible FRAUDE en la carga ID {carga_id}"
        nueva_notificacion = Notificacion(
            usuario_id=carga.usuario_id,
            mensaje=mensaje
        )
        db.session.add(nueva_notificacion)

    db.session.commit()


    return {
        "indicadores": indicadores,
        "resultado_fraude": resultado_texto,
        "probabilidad": round(probabilidad, 4)
    }
