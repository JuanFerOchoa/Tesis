import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CompletarPerfil = () => {
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargandoEmpresas, setCargandoEmpresas] = useState(true); // Estado para saber si estamos cargando empresas
  const navigate = useNavigate();

  // Cargar lista de empresas al montar el componente
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await api.get('/empresas');  // Asegúrate de que la URL sea correcta
        if (response.data && Array.isArray(response.data)) {
          setEmpresas(response.data);
        } else {
          setMensajeError('No se encontraron empresas disponibles.');
        }
      } catch (error) {
        console.error('Error al obtener empresas:', error);
        setMensajeError('No se pudieron cargar las empresas.');
      } finally {
        setCargandoEmpresas(false);  // Independientemente de si la petición fue exitosa o no
      }
    };

    fetchEmpresas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cedula || !telefono || !empresaId) {
      setMensajeError('Todos los campos son obligatorios');
      return;
    }

    const data = {
      cedula,
      telefono,
      empresa_id: empresaId, // Se está enviando el ID de la empresa seleccionada
    };

    try {
      const response = await api.put('/completar-perfil', data);
      setMensaje(response.data.msg);
      setMensajeError('');
      navigate('/perfil');
    } catch (error) {
      if (error.response) {
        setMensajeError(error.response.data.msg);
      } else {
        setMensajeError('Error al completar el perfil.');
      }
      setMensaje('');
    }
  };

  return (
    <div>
      <h2>Completar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Cédula:</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Empresa:</label>
          {cargandoEmpresas ? (
            <p>Cargando empresas...</p> // Muestra un mensaje de carga mientras se obtienen las empresas
          ) : (
            <select
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              required
            >
              <option value="">Selecciona una empresa</option>
              {empresas.length > 0 ? (
                empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay empresas disponibles</option>
              )}
            </select>
          )}
        </div>
        <button type="submit">Actualizar Perfil</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
      {mensajeError && <p style={{ color: 'red' }}>{mensajeError}</p>}
    </div>
  );
};

export default CompletarPerfil;
