# app/controllers/dashboard_controller.py
from app.models import Empresa, UsuarioApp, CargaFinanciera, ResultadoFraude
from app.extensions import db
from sqlalchemy import func

def obtener_estadisticas_dashboard():
    total_empresas = db.session.query(func.count(Empresa.empresa_id)).scalar()
    total_usuarios = db.session.query(func.count(UsuarioApp.usuario_id)).scalar()
    total_cargas = db.session.query(func.count(CargaFinanciera.carga_id)).scalar()
    total_analisis = db.session.query(func.count(ResultadoFraude.resultado_id)).scalar()

   
    fraudes_detectados = db.session.query(func.count(ResultadoFraude.resultado_id))\
                                   .filter(ResultadoFraude.es_fraude == True).scalar()

    porcentaje_fraude = (fraudes_detectados / total_analisis * 100) if total_analisis > 0 else 0

   
    ultimos_analisis = db.session.query(ResultadoFraude).order_by(ResultadoFraude.analizado_en.desc()).limit(5).all()

    ultimos_analisis_resumen = []
    for res in ultimos_analisis:
        ultimos_analisis_resumen.append({
            "resultado_id": res.resultado_id,
            "carga_id": res.carga_id,
            "analizado_por": res.analizado_por,
            "es_fraude": res.es_fraude,
            "probabilidad_fraude": float(res.probabilidad_fraude),
            "resultado_texto": res.resultado_texto,
            "analizado_en": res.analizado_en.isoformat()
        })

    return {
        "total_empresas": total_empresas,
        "total_usuarios": total_usuarios,
        "total_cargas": total_cargas,
        "total_analisis": total_analisis,
        "fraudes_detectados": fraudes_detectados,
        "porcentaje_fraude": round(porcentaje_fraude, 2),
        "ultimos_analisis": ultimos_analisis_resumen
    }
