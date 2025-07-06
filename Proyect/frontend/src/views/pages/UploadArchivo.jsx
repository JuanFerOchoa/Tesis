import React, { useState } from 'react';
import api from '../../services/api';

import styles from '../../styles/pages/Upload.module.scss';
import SidebarMenu from '../../components/MenuLateral';
import NavbarMenu from '../../components/navbar';





const UploadArchivo = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message) {
        setMessage(response.data.message);
      } else {
        setMessage('Datos cargados con éxito');
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className={styles['upload-container']}>
  <SidebarMenu />
  <NavbarMenu />
  <h2>Subir archivo financiero</h2>

  <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />

  <button className={styles['upload-btn']} onClick={handleUpload} disabled={loading}>
    {loading ? 'Subiendo...' : 'Subir'}
  </button>

  {error && <p className={styles.error}>{error}</p>}
  {message && <p className={styles.success}>{message}</p>}
</div>

  );
};

export default UploadArchivo;
