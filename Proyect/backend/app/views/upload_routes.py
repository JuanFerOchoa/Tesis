from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.controllers.etl_controller import procesar_archivo_excel

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se proporcionó ningún archivo'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nombre de archivo vacío'}), 400

    usuario_id = get_jwt_identity()
    result, status_code = procesar_archivo_excel(file, usuario_id)
    return jsonify(result), status_code 


