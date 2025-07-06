import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

import styles from '../../styles/pages/Archivo.module.scss';

const Archivo = () => {
  const { cargaId } = useParams();
  const [datos, setDatos] = useState({
    estado_resultados: [],
    estado_situacion: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cargaId) return;

    setLoading(true);
    setError(null);

    api.get(`/carga/${cargaId}/datos`)
      .then(res => {
        setDatos({
          estado_resultados: res.data.estado_resultados,
          estado_situacion: res.data.estado_situacion
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
  }, [cargaId]);

  if (loading) return <p className={styles.loading}>Cargando datos...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Datos Financieros - Carga ID: {cargaId}</h1>

      <article className={styles.tableSection}>
        <h2 className={styles.subtitle}>Estado de Resultados</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th>Rubro Económico</th>
            </tr>
          </thead>
          <tbody>
            {datos.estado_resultados.map((item, i) => (
              <tr key={`er-${i}`}>
                <td>{item.codigo}</td>
                <td>{item.cuenta}</td>
                <td>{item.rubro_economico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className={styles.tableSection}>
        <h2 className={styles.subtitle}>Estado de Situación</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th>Rubro Económico</th>
            </tr>
          </thead>
          <tbody>
            {datos.estado_situacion.map((item, i) => (
              <tr key={`es-${i}`}>
                <td>{item.codigo}</td>
                <td>{item.cuenta}</td>
                <td>{item.rubro_economico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
};

export default Archivo;
