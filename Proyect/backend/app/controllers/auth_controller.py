from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db
from app.models import UsuarioApp, RolUsuario

def register():
    data = request.get_json() or {}
    required = ('cedula','nombre','apellido','email','password','rol')
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify(msg=f"Faltan campos: {', '.join(missing)}"), 400

    # validar rol
    rol = RolUsuario.query.filter_by(nombre=data['rol']).first()
    if not rol:
        return jsonify(msg="Rol inválido"), 400

    # evitar duplicados
    exists = UsuarioApp.query.filter(
        (UsuarioApp.email == data['email']) |
        (UsuarioApp.cedula == data['cedula'])
    ).first()
    if exists:
        return jsonify(msg="Email o cédula ya registrados"), 409

    # crear usuario
    pw_hash = generate_password_hash(data['password'])
    user = UsuarioApp(
        cedula          = data['cedula'],
        nombre          = data['nombre'],
        apellido        = data['apellido'],
        telefono        = data.get('telefono'),
        email           = data['email'],
        contrasena_hash = pw_hash,
        rol_id          = rol.rol_id
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(msg="Usuario registrado exitosamente"), 201

def login():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        return jsonify(msg="Email y password son obligatorios"), 400

    user = UsuarioApp.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.contrasena_hash, data['password']):
        return jsonify(msg="Credenciales inválidas"), 401

    token = create_access_token(identity=str(user.usuario_id))
    return jsonify(access_token=token), 200

@jwt_required()
def me():
    uid = get_jwt_identity()
    user = UsuarioApp.query.get(uid)
    return jsonify(
        usuario_id = user.usuario_id,
        cedula     = user.cedula,
        nombre     = user.nombre,
        apellido   = user.apellido,
        email      = user.email,
        rol        = user.rol.nombre,
        creado_en  = user.creado_en.isoformat()
    ), 200
