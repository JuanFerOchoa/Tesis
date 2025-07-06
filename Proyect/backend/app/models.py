# backend/app/models.py
from datetime import datetime
from app.extensions import db


class RolUsuario(db.Model):
    __tablename__ = 'roles_usuarios'
    rol_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)

class UsuarioApp(db.Model):
    __tablename__ = 'usuarios_app'
    usuario_id      = db.Column(db.Integer, primary_key=True)
    """ cedula          = db.Column(db.String(20), unique=True, nullable=False) """
    cedula = db.Column(db.String(20), unique=True, nullable=True)

    nombre          = db.Column(db.String(100), nullable=False)
    apellido        = db.Column(db.String(100), nullable=False)
    telefono        = db.Column(db.String(20))
    email           = db.Column(db.String(100), unique=True, nullable=False)
    contrasena_hash = db.Column(db.Text, nullable=False)
    rol_id          = db.Column(db.Integer, db.ForeignKey('roles_usuarios.rol_id'), nullable=False)
    creado_en       = db.Column(db.DateTime, default=datetime.utcnow)

    # Campos nuevos
    token_recuperacion        = db.Column(db.String(100), nullable=True)
    token_recuperacion_expira = db.Column(db.DateTime, nullable=True)

    rol = db.relationship('RolUsuario')
    
class Empresa(db.Model):
    __tablename__ = 'empresas'
    empresa_id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    ruc = db.Column(db.String(20))
    razon_social = db.Column(db.String(255))
    direccion = db.Column(db.Text)
    telefono = db.Column(db.String(20))
    email_contacto = db.Column(db.String(100))

class CargaFinanciera(db.Model):
    __tablename__ = 'cargas_financieras'
    carga_id = db.Column(db.Integer, primary_key=True)
    nombre_archivo = db.Column(db.String(255), nullable=False)
    fecha_carga = db.Column(db.DateTime, default=db.func.current_timestamp())
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios_app.usuario_id'), nullable=False)
    empresa_id = db.Column(db.Integer, db.ForeignKey('empresas.empresa_id'), nullable=False)

    estado_situacion = db.relationship('EstadoSituacion', back_populates='carga', cascade='all, delete-orphan')
    estado_resultados = db.relationship('EstadoResultados', back_populates='carga', cascade='all, delete-orphan')

class ArchivoCifrado(db.Model):
    __tablename__ = 'archivos_cifrados'
    archivo_id = db.Column(db.Integer, primary_key=True)
    carga_id = db.Column(db.Integer, db.ForeignKey('cargas_financieras.carga_id'), nullable=False)
    ruta_archivo = db.Column(db.String(255), nullable=False)
    hash_archivo = db.Column(db.Text)
    clave_cifrado = db.Column(db.Text)
    extension_archivo = db.Column(db.String(10))


#MODELOS PARA LOS DATOS
# app/models.py
# EstadoSituacion
class EstadoSituacion(db.Model):
    __tablename__ = 'estado_situacion'

    id = db.Column(db.Integer, primary_key=True)
    carga_id = db.Column(db.Integer, db.ForeignKey('cargas_financieras.carga_id'), nullable=False)
    codigo = db.Column(db.String(50))
    cuenta = db.Column(db.String(255))
    rubro_economico = db.Column(db.Float)

    carga = db.relationship('CargaFinanciera', back_populates='estado_situacion')


# EstadoResultados
class EstadoResultados(db.Model):
    __tablename__ = 'estado_resultados'

    id = db.Column(db.Integer, primary_key=True)
    carga_id = db.Column(db.Integer, db.ForeignKey('cargas_financieras.carga_id'), nullable=False)
    codigo = db.Column(db.String(50))
    cuenta = db.Column(db.String(255))
    rubro_economico = db.Column(db.Float)

    carga = db.relationship('CargaFinanciera', back_populates='estado_resultados')

#ResultadosFraude

class ResultadoFraude(db.Model):
    __tablename__ = 'resultados_fraude'

    resultado_id = db.Column(db.Integer, primary_key=True)
    carga_id = db.Column(db.Integer, db.ForeignKey('cargas_financieras.carga_id'), nullable=False)
    analizado_por = db.Column(db.Integer, db.ForeignKey('usuarios_app.usuario_id'), nullable=False)
    es_fraude = db.Column(db.Boolean)
    probabilidad_fraude = db.Column(db.Numeric(5, 4))
    analizado_en = db.Column(db.DateTime, default=db.func.current_timestamp())
    resultado_texto = db.Column(db.String(50))

    liquidez_corriente = db.Column(db.Numeric(10, 4))
    margen_neto = db.Column(db.Numeric(10, 4))
    nivel_endeudamiento = db.Column(db.Numeric(10, 4))
    prueba_acida = db.Column(db.Numeric(10, 4))


class Notificacion(db.Model):
    __tablename__ = 'notificaciones'

    notificacion_id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios_app.usuario_id'), nullable=False)
    mensaje = db.Column(db.String(255), nullable=False)
    leido = db.Column(db.Boolean, default=False)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

    usuario = db.relationship('UsuarioApp')
