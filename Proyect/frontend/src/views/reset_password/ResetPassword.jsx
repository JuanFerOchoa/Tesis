import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import styles from './resetPassword.module.scss';

import logo from '../../components/imagenes/ciclo contable lg.png';

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        nueva_password: nuevaPassword,
        confirmar_password: confirmarPassword,
      });
      setMensaje(res.data.msg);
    } catch (err) {
      setMensaje(err.response?.data?.msg || 'Error al actualizar la contraseña');
    }
  };

  return (
    <div className={styles['recuperar-container']}>
      <div className={styles['form-box']}>
        <div className={styles['header']}>
          <img src={logo} alt="Logo" className={styles['logo-img']} />
          <div className={styles['logo-text']}>Ciclo Contable</div>
          <div className={styles['version-numbers']}>Versión 1.0.0</div>
        </div>

        <h2 className={styles['subtitle']}>Restablecer Contraseña</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label>Nueva contraseña</label>
            <div className={styles['password-wrapper']}>
            <input
                type={mostrarNueva ? 'text' : 'password'}
                placeholder="Ingrese nueva contraseña"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
            />
            <span
                className="material-symbols-outlined"
                onClick={() => setMostrarNueva(!mostrarNueva)}
            >
                {mostrarNueva ? 'visibility_off' : 'visibility'}
            </span>
            </div>

          </div>

          <div className={styles['form-group']}>
            <label>Confirmar contraseña</label>
            <div className={styles['password-wrapper']}>
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                placeholder="Confirme la nueva contraseña"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
              <span
                className="material-symbols-outlined"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
              >
                {mostrarConfirmar ? 'visibility_off' : 'visibility'}
              </span>
            </div>
          </div>

          <div className={styles['button-group']}>
            <a href="/" className={styles['cancel-btn']}>Cancelar</a>
            <button type="submit" className={styles['submit-btn']}>Actualizar</button>
          </div>

          {mensaje && <p className={styles['mensaje']}>{mensaje}</p>}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
