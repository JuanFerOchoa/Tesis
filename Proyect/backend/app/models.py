from datetime import datetime
from app import db

class RolUsuario(db.Model):
    __tablename__ = 'roles_usuarios'
    rol_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)

class UsuarioApp(db.Model):
    __tablename__ = 'usuarios_app'
    usuario_id      = db.Column(db.Integer, primary_key=True)
    cedula          = db.Column(db.String(20), unique=True, nullable=False)
    nombre          = db.Column(db.String(100), nullable=False)
    apellido        = db.Column(db.String(100), nullable=False)
    telefono        = db.Column(db.String(20))
    email           = db.Column(db.String(100), unique=True, nullable=False)
    contrasena_hash = db.Column(db.Text, nullable=False)
    rol_id          = db.Column(db.Integer, db.ForeignKey('roles_usuarios.rol_id'), nullable=False)
    creado_en       = db.Column(db.DateTime, default=datetime.utcnow)

    rol = db.relationship('RolUsuario')
