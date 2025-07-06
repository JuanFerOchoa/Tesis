
# backend/app/controllers/usuario_controller.py
from flask import request, jsonify
from flask import Blueprint

from app import db
from app.models import UsuarioApp

from flask import  jsonify

routes = Blueprint("routes", __name__)
#CRUD
# Ver todos los usuarios
from flask import jsonify
from app.models import UsuarioApp

def listar_usuarios():
    usuarios = UsuarioApp.query.all()
    usuarios_list = []
    for usuario in usuarios:
        usuarios_list.append({
            "usuario_id": usuario.usuario_id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "telefono": usuario.telefono,
            "cedula": usuario.cedula,
            "email": usuario.email,
            "rol": usuario.rol.nombre,
            "creado_en": usuario.creado_en.isoformat()
        })
    return jsonify(usuarios_list), 200


# Editar usuario
def editar_usuario(usuario_id):
    data = request.get_json() or {}
    usuario = UsuarioApp.query.get(usuario_id)

    if not usuario:
        return jsonify(msg="Usuario no encontrado"), 404


    if 'nombre' in data:
        usuario.nombre = data['nombre']
    if 'apellido' in data:
        usuario.apellido = data['apellido']
    if 'telefono' in data:
        usuario.telefono = data['telefono']
    if 'email' in data:
        usuario.email = data['email']

    db.session.commit()

    return jsonify(msg="Usuario actualizado exitosamente"), 200


def eliminar_usuario(usuario_id):
    usuario = UsuarioApp.query.get(usuario_id)
    
    if not usuario:
        return jsonify(msg="Usuario no encontrado"), 404
    
    db.session.delete(usuario)
    db.session.commit()

    return jsonify(msg="Usuario eliminado exitosamente"), 200
