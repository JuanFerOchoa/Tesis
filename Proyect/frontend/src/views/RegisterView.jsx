// src/views/RegisterView.jsx
import React, { useState } from 'react';
import api from '../services/api';

export default function RegisterView() {
  const [form, setForm] = useState({
    cedula: '', nombre: '', apellido: '',
    telefono: '', email: '', password: '', rol: 'contador'
  });
  const [msg, setMsg] = useState(null);

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      setMsg(res.data.msg);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error al registrar');
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={onSubmit}>
        <input name="cedula"    placeholder="Cédula"      value={form.cedula}    onChange={onChange} required/>
        <input name="nombre"    placeholder="Nombre"      value={form.nombre}    onChange={onChange} required/>
        <input name="apellido"  placeholder="Apellido"    value={form.apellido}  onChange={onChange} required/>
        <input name="telefono"  placeholder="Teléfono"    value={form.telefono}  onChange={onChange}/>
        <input name="email"     type="email" placeholder="Email" value={form.email}    onChange={onChange} required/>
        <input name="password"  type="password" placeholder="Contraseña" value={form.password} onChange={onChange} required/>
        <select name="rol" value={form.rol} onChange={onChange}>
          <option value="contador">Contador</option>
          <option value="auditor">Auditor</option>
        </select>
        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}
