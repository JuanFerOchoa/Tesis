from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Notificacion
from app.extensions import db

notificaciones_bp = Blueprint('notificaciones', __name__)

@notificaciones_bp.route('/notificaciones', methods=['GET'])
@jwt_required()
def obtener_notificaciones():
    usuario_id = get_jwt_identity()
    notificaciones = Notificacion.query.filter_by(usuario_id=usuario_id).order_by(Notificacion.creado_en.desc()).all()
    return jsonify([
        {
            "id": n.notificacion_id,
            "mensaje": n.mensaje,
            "leido": n.leido,
            "creado_en": n.creado_en.isoformat()
        } for n in notificaciones
    ])

@notificaciones_bp.route('/notificaciones/<int:notificacion_id>/leer', methods=['POST'])
@jwt_required()
def marcar_leida(notificacion_id):
    usuario_id = get_jwt_identity()
    noti = Notificacion.query.filter_by(notificacion_id=notificacion_id, usuario_id=usuario_id).first()
    if not noti:
        return jsonify({"error": "No encontrada o no autorizada"}), 404
    noti.leido = True
    db.session.commit()
    return jsonify({"mensaje": "Marcada como leída"})
