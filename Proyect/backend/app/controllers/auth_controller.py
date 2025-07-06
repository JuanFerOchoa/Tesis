# backend/app/controllers/auth_controller.py
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app import db
from app.models import UsuarioApp, RolUsuario

from flask import Blueprint, jsonify, redirect, url_for
from flask_dance.contrib.google import google


import secrets
from datetime import datetime, timedelta
from flask_mail import Message
from app import mail



routes = Blueprint("routes", __name__)


import re
from flask import request, jsonify
from werkzeug.security import generate_password_hash

def validar_password(password):
    """Valida que la contraseña tenga mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"""
    if len(password) < 8:
        return "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return "La contraseña debe contener al menos una letra mayúscula"
    if not re.search(r'[a-z]', password):
        return "La contraseña debe contener al menos una letra minúscula"
    if not re.search(r'[0-9]', password):
        return "La contraseña debe contener al menos un número"
    if not re.search(r'[\W_]', password):  
        return "La contraseña debe contener al menos un carácter especial"
    return None

def validar_email(email):
    """Valida el formato del email"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email)

def register():
    data = request.get_json() or {}

    required = ('nombre', 'apellido', 'email', 'password', 'confirm_password')
    
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify(msg=f"Faltan campos: {', '.join(missing)}"), 400

    empty = [f for f in required if not str(data[f]).strip()]
    if empty:
        return jsonify(msg=f"Debe completar todos los campos: {', '.join(empty)}"), 400

    if not validar_email(data['email']):
        return jsonify(msg="Formato de correo es inválido"), 400

    if data['password'] != data['confirm_password']:
        return jsonify(msg="Las contraseñas no coinciden"), 400

    password_error = validar_password(data['password'])
    if password_error:
        return jsonify(msg=password_error), 400

    if UsuarioApp.query.filter_by(email=data['email']).first():
        return jsonify(msg="correo ya registrado"), 409


    rol = RolUsuario.query.filter_by(nombre='auditor').first()
    if not rol:
        return jsonify(msg="Rol 'auditor' no encontrado"), 500

    pw_hash = generate_password_hash(data['password'])
    user = UsuarioApp(
        cedula=None,  
        nombre=data['nombre'].strip(),
        apellido=data['apellido'].strip(),
        telefono=None,
        email=data['email'].strip(),
        contrasena_hash=pw_hash,
        rol_id=rol.rol_id
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(msg="Usuario registrado exitosamente"), 201





def login():
    data = request.get_json() or {}
    if not data.get('email') or not data.get('password'):
        return jsonify(msg="Todos los campos son obligatorios"), 400

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
        telefono   = user.telefono,
        email      = user.email,
        rol        = user.rol.nombre,
        creado_en  = user.creado_en.isoformat()
    ), 200


def google_login_callback():
    if not google.authorized:
        return redirect(url_for("google.login"))

    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        return jsonify(msg="Error al obtener los datos de Google"), 500

    data = resp.json()
    email = data["email"]
    nombre = data.get("given_name", "")
    apellido = data.get("family_name", "")

    user = UsuarioApp.query.filter_by(email=email).first()
    if not user:
        rol = RolUsuario.query.filter_by(nombre='auditor').first()
        if not rol:
            return jsonify(msg="Rol auditor no encontrado"), 500

        user = UsuarioApp(
            cedula=None,
            nombre=nombre,
            apellido=apellido,
            telefono=None,
            email=email,
            contrasena_hash="",  # No se usa en login con Google
            rol_id=rol.rol_id
        )
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=user.usuario_id)
    return redirect(f"/login-success?token={token}")



# auth_controller.py
def recuperar_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify(msg="Debe ingresar un correo"), 400

    user = UsuarioApp.query.filter_by(email=email).first()
    if not user:
        return jsonify(msg="Correo no encontrado"), 404

    import secrets
    from datetime import datetime, timedelta
    from flask_mail import Message
    from app import mail

    token = secrets.token_urlsafe(32)
    expiracion = datetime.utcnow() + timedelta(hours=1)

    user.token_recuperacion = token
    user.token_recuperacion_expira = expiracion
    db.session.commit()

    enlace = f"http://localhost:3000/resetcontrasena?token={token}"

    mensaje = Message("Recuperación de contraseña", recipients=[email])
    mensaje.body = f"""
Hola {user.nombre},

Haz clic en este enlace para restablecer tu contraseña (válido por 1 hora):

{enlace}

Si no solicitaste esto, ignora el mensaje.
"""
    mail.send(mensaje)

    return jsonify(msg="Correo de recuperación enviado"), 200


def reset_password():
    data = request.get_json()
    token = data.get('token')
    nueva_pass = data.get('nueva_password')
    confirmar_pass = data.get('confirmar_password')

    if not token or not nueva_pass or not confirmar_pass:
        return jsonify(msg="Faltan campos obligatorios"), 400

    if nueva_pass != confirmar_pass:
        return jsonify(msg="Las contraseñas no coinciden"), 400

    password_error = validar_password(nueva_pass)
    if password_error:
        return jsonify(msg=password_error), 400

    user = UsuarioApp.query.filter_by(token_recuperacion=token).first()
    if not user:
        return jsonify(msg="Token inválido o ya usado"), 400

    if user.token_recuperacion_expira < datetime.utcnow():
        return jsonify(msg="El token ha expirado"), 400

    user.contrasena_hash = generate_password_hash(nueva_pass)
    user.token_recuperacion = None
    user.token_recuperacion_expira = None

    db.session.commit()

    return jsonify(msg="Contraseña actualizada exitosamente"), 200
