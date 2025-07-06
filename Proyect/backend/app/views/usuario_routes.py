# backend/app/views/usuario_routes.py
from flask import Blueprint
from app.controllers.usuarios_controller  import listar_usuarios, editar_usuario, eliminar_usuario

usuario_bp = Blueprint('usuario', __name__)

usuario_bp.add_url_rule('/', 'listar_usuarios', listar_usuarios, methods=['GET'])
usuario_bp.add_url_rule('/<int:usuario_id>', 'editar_usuario', editar_usuario, methods=['PUT'])
usuario_bp.add_url_rule('/<int:usuario_id>', 'eliminar_usuario', eliminar_usuario, methods=['DELETE'])