import React, { useState } from 'react';
import api from '../../services/api';
import styles from './recuperarPassword.module.scss';
import logo from '../../components/imagenes/ciclo contable lg.png'; 

function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/recuperar-password', { email });
      setMensaje(res.data.msg);
    } catch (err) {
      setMensaje(err.response?.data?.msg || 'Error al enviar el correo');
    }
  };

  return (
   <div className={styles['recuperar-container']}>
  <div className={styles['form-box']}>
    <div className={styles.header}>
      <div className={styles['logo-text']}>Ciclo Contable</div>
      <div className={styles['version-numbers']}>1.0</div>
      <img src={logo} alt="Logo Ciclo Contable" className={styles['logo-img']} />
    </div>

    <p className={styles.subtitle}>¿Olvidó su contraseña?</p>

    <form onSubmit={handleSubmit}>
      <div className={styles['form-group']}>
        <label htmlFor="email">Dirección de correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="test@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles['button-group']}>
        <a href="/" className={styles['cancel-btn']}>Cancelar</a>
        <button type="submit" className={styles['submit-btn']}>
          Enviar enlace de restablecimiento
        </button>
      </div>

      {mensaje && <p className={styles.mensaje}>{mensaje}</p>}
    </form>
  </div>
</div>

  );
}

export default RecuperarPassword;
