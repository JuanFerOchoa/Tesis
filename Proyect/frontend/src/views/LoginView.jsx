// src/views/LoginView.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

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
      navigate('/me');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error al iniciar sesión');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={onSubmit}>
        <input name="email"    type="email"     placeholder="Email"      value={form.email}    onChange={onChange} required/>
        <input name="password" type="password"  placeholder="Contraseña" value={form.password} onChange={onChange} required/>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
