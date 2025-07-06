import React, { useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import styles from '../styles/register.module.scss'; 

export default function RegisterView() {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [msg, setMsg] = useState(null);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validarEmail = (email) => {
    const pattern = /^[\w.-]+@[\w.-]+\.\w+$/;
    return pattern.test(email);
  };

  const validarPassword = (password) => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula.";
    if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula.";
    if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número.";
    if (!/[\W_]/.test(password)) return "La contraseña debe contener al menos un carácter especial.";
    return null;
  };

  const onSubmit = async e => {
    e.preventDefault();

    const campos = ['nombre', 'apellido', 'email', 'password', 'confirm_password'];
    const vacios = campos.filter(c => !form[c].trim());
    if (vacios.length > 0) {
      setMsg('Por favor completa todos los campos.');
      return;
    }

    if (!validarEmail(form.email)) {
      setMsg('Correo electrónico no válido.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setMsg('Las contraseñas no coinciden.');
      return;
    }

    const errorPwd = validarPassword(form.password);
    if (errorPwd) {
      setMsg(errorPwd);
      return;
    }

    try {
      const res = await api.post('/auth/register', form);
      setMsg(res.data.msg);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error al registrar');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>CC</div>
        <h2>Regístrate</h2>

        <div className={styles.socialLogin}>
          <button><i className="fab fa-google"></i> Google</button>
          <button><i className="fab fa-facebook-f"></i> Facebook</button>
        </div>

        <div className={styles.divider}>
          <hr /><span>o regístrate con</span><hr />
        </div>

        <form className={styles.registerForm} onSubmit={onSubmit}>
          <div className={styles.nameInputs}>
            <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={onChange} required />
            <input type="text" name="apellido" placeholder="Apellido" value={form.apellido} onChange={onChange} required />
          </div>

          <input type="email" name="email" placeholder="Correo electrónico" value={form.email} onChange={onChange} required />
          <input type="password" name="password" placeholder="Contraseña" value={form.password} onChange={onChange} required />
          <input type="password" name="confirm_password" placeholder="Confirmar contraseña" value={form.confirm_password} onChange={onChange} required />

          {msg && <p className={styles.errorMsg}>{msg}</p>}

          <button type="submit">REGISTRARSE</button>
        </form>

        <div className={styles.loginLink}>
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.circle}></div>
        <h1>Bienvenido a Ciclo Contable</h1>
        <p>
          CC brinda una solución integral contra el fraude financiero, nuestro sistema especializado ayuda a identificar y prevenir actividades sospechosas dentro de la empresa.
        </p>
        <div className={styles.bottomCircles}>
          <div></div><div></div><div></div>
        </div>
      </div>
    </div>
  );
}
