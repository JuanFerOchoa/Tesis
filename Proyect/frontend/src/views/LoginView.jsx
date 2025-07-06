import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/login.module.scss';
import { Link } from 'react-router-dom';

export default function LoginView() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.access_token);
      navigate('/inicio');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error al iniciar sesión');
    }
  };

  return (
<div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.circle}></div>
        <h1>Bienvenido a Ciclo Contable</h1>
        <p>
          CC brindar una solución integral contra el fraude financiero, nuestro sistema especializado ayuda a identificar y prevenir actividades sospechosas dentro del la empresa.
        </p>
        <div className={styles.bottomCircles}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.logo}>CC</div>
        <h2>Iniciar sesión</h2>
        <div className={styles.socialLogin}>
          <button onClick={() => window.location.href = 'http://localhost:5000/login/google'}>
            <i className="fab fa-google"></i> Iniciar con Google
          </button>

          <button><i className="fab fa-facebook-f"></i> Facebook</button>
        </div>

        <div className={styles.divider}>
          <hr /><span>o inicia sesión con</span><hr />
        </div>

        <form className={styles.loginForm} onSubmit={onSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={onChange}
            required
          />
          <div className={styles.options}>
            <label>
              <input type="checkbox" /> Recordar este dispositivo
            </label>
            <Link to="/recuperarcontrasena">¿Olvidaste tu contraseña?</Link>
          </div>
          {msg && <p className={styles.errorMsg}>{msg}</p>}

          <button type="submit">INICIAR SESIÓN</button>
        </form>

        <div className={styles.signup}>
          ¿Nuevo en CC? <Link to="/register">Regístrate ahora</Link>
        </div>
      </div>
    </div>
  );
}

