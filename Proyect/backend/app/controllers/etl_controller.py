# backend/etl_controller.py

import os
import pandas as pd
from werkzeug.utils import secure_filename
from datetime import datetime
import hashlib
from cryptography.fernet import Fernet

from app.extensions import db
from app.models import Empresa, CargaFinanciera, ArchivoCifrado

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
MAX_FILE_SIZE_MB = 10

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validar_y_limpiar_hoja(df):
    errores = []
    # Eliminar columnas y filas vacías completamente
    df = df.dropna(how="all", axis=1).dropna(how="all", axis=0)

    col_cuenta = None
    col_rubro = None

    # Buscar columnas por contenido en la primera fila
    for col in df.columns:
        primer_valor = str(df[col].iloc[0]) if not pd.isna(df[col].iloc[0]) else ""
        if "Cuenta" in primer_valor:
            col_cuenta = col
        if "Rúbro Económico" in primer_valor or "Rubro Económico" in primer_valor:
            col_rubro = col

    # Si no encuentra columnas por contenido, asignar últimas dos con datos
    if col_cuenta is None or col_rubro is None:
        non_empty_cols = df.dropna(axis=1, how='all').columns.tolist()
        if len(non_empty_cols) >= 2:
            col_cuenta = col_cuenta or non_empty_cols[-2]
            col_rubro = col_rubro or non_empty_cols[-1]
        else:
            errores.append("No se encontraron columnas adecuadas para 'Cuenta' y 'Rubro Económico'.")
            return df, errores

    # Eliminar filas donde la primera columna (código) esté vacía o sea "Código"
    df = df[df.iloc[:, 0].notna() & (df.iloc[:, 0].astype(str).str.strip().str.lower() != "código")]

    # Renombrar columnas para estandarizar
    df = df.rename(columns={
        df.columns[0]: "codigo",
        col_cuenta: "cuenta",
        col_rubro: "rubro_economico"
    })

    # Limpiar valores rubro económico: poner 0 si vacío o no válido
    df["rubro_economico"] = df["rubro_economico"].apply(
        lambda x: 0 if pd.isna(x) or str(x).strip().lower() in ['', 'nan', 'none'] else x
    )

    df.reset_index(drop=True, inplace=True)
    return df, errores


def procesar_archivo_excel(file, usuario_id):
    if not allowed_file(file.filename):
        return {'error': 'Formato no permitido'}, 400

    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)

    if file_length > MAX_FILE_SIZE_MB * 1024 * 1024:
        return {'error': 'Archivo mayor a 10MB'}, 400

    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    filename = secure_filename(file.filename)
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename_final = f"{timestamp}_{filename}"
    path_original = os.path.join(UPLOAD_FOLDER, filename_final)
    file.save(path_original)

    hojas = pd.read_excel(path_original, sheet_name=None)
    
    hoja_sit = None
    hoja_res = None
    # Buscar hojas por nombre
    for sheet_name in hojas.keys():
        sheet_name_upper = sheet_name.upper()
        if 'SIT' in sheet_name_upper or 'SITUACIÓN' in sheet_name_upper:
            hoja_sit = pd.read_excel(path_original, sheet_name=sheet_name, skiprows=5)
        elif 'RESULTADOS' in sheet_name_upper:
            hoja_res = pd.read_excel(path_original, sheet_name=sheet_name, skiprows=5)

    if hoja_sit is None or hoja_res is None:
        return {'error': 'No se encontraron las hojas requeridas (Situación y Resultados)'}, 400

    hoja_sit, errores_sit = validar_y_limpiar_hoja(hoja_sit)
    hoja_res, errores_res = validar_y_limpiar_hoja(hoja_res)

    errores = errores_sit + errores_res
    if errores:
        return {'error': 'Errores en el archivo', 'detalles': errores}, 400

    # Obtener datos empresa desde la primera hoja original (sin skiprows)
    primera_hoja = hojas[list(hojas.keys())[0]]
    empresa_nombre = primera_hoja.iloc[0, 1]
    empresa_ruc = primera_hoja.iloc[1, 1]
    empresa_dir = primera_hoja.iloc[2, 1]

    empresa = Empresa.query.filter_by(nombre=empresa_nombre, ruc=empresa_ruc).first()
    if not empresa:
        empresa = Empresa(nombre=empresa_nombre, ruc=empresa_ruc, direccion=empresa_dir)
        db.session.add(empresa)
        db.session.commit()

    carga = CargaFinanciera(
        nombre_archivo=filename_final,
        usuario_id=usuario_id,
        empresa_id=empresa.empresa_id,
        fecha_carga=datetime.utcnow()
    )
    db.session.add(carga)
    db.session.commit()

    with open(path_original, 'rb') as f:
        contenido = f.read()

    clave = Fernet.generate_key()
    fernet = Fernet(clave)
    cifrado = fernet.encrypt(contenido)

    path_cifrado = os.path.join(UPLOAD_FOLDER, f"enc_{filename_final}")
    with open(path_cifrado, 'wb') as f:
        f.write(cifrado)

    hash_archivo = hashlib.sha256(contenido).hexdigest()

    archivo = ArchivoCifrado(
        carga_id=carga.carga_id,
        ruta_archivo=path_cifrado,
        hash_archivo=hash_archivo,
        clave_cifrado=clave.decode(),
        extension_archivo=filename_final.rsplit('.', 1)[-1].lower()
    )
    db.session.add(archivo)
    db.session.commit()

    guardar_datos_financieros(
        carga_id=carga.carga_id,
        estado_resultados_list=hoja_res.to_dict(orient='records'),
        estado_situacion_list=hoja_sit.to_dict(orient='records')
    )

    return {
        'message': 'Archivo subido y procesado correctamente',
        'carga_id': carga.carga_id,
        'estado_situacion': hoja_sit.to_dict(orient='records'),
        'estado_resultados': hoja_res.to_dict(orient='records')
    }, 200


def guardar_datos_financieros(carga_id, estado_resultados_list, estado_situacion_list):
    from app.models import EstadoResultados, EstadoSituacion, db

    # Borrar datos anteriores si existen
    EstadoResultados.query.filter_by(carga_id=carga_id).delete()
    EstadoSituacion.query.filter_by(carga_id=carga_id).delete()
    db.session.commit()  # Confirmar eliminación antes de insertar

    # Insertar Estado de Resultados
    for er in estado_resultados_list:
        # Usamos las columnas renombradas: 'codigo', 'cuenta', 'rubro_economico'
        codigo = er.get('codigo')
        if not codigo or str(codigo).strip().lower() == 'código':
            continue

        try:
            rubro = float(str(er.get('rubro_economico', 0)).replace(',', '').strip())
        except (ValueError, TypeError):
            rubro = 0.0

        registro_er = EstadoResultados(
            carga_id=carga_id,
            codigo=str(codigo).strip(),
            cuenta=er.get('cuenta', '').strip() if er.get('cuenta') else '',
            rubro_economico=rubro
        )
        db.session.add(registro_er)

    # Insertar Estado de Situación
    for es in estado_situacion_list:
        codigo = es.get('codigo')
        if not codigo or str(codigo).strip().lower() == 'código':
            continue

        try:
            rubro = float(str(es.get('rubro_economico', 0)).replace(',', '').strip())
        except (ValueError, TypeError):
            rubro = 0.0

        registro_es = EstadoSituacion(
            carga_id=carga_id,
            codigo=str(codigo).strip(),
            cuenta=es.get('cuenta', '').strip() if es.get('cuenta') else '',
            rubro_economico=rubro
        )
        db.session.add(registro_es)

    db.session.commit()
