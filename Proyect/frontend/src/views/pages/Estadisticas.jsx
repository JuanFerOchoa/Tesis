import React, { useState } from 'react';
import api from '../../services/api';
import SidebarMenu from '../../components/MenuLateral';
import NavbarMenu from '../../components/navbar';

import styles from '../../styles/pages/Estadisticas.module.scss';

const Estadisticas = () => {
  const [cargaId, setCargaId] = useState('');
  const [anteriorId, setAnteriorId] = useState('');
  const [indicadores, setIndicadores] = useState(null);
  const [vertical, setVertical] = useState(null);
  const [horizontal, setHorizontal] = useState(null);
  const [msg, setMsg] = useState(null);  // Estado para mensaje

  const obtenerIndicadores = async () => {
    try {
      setMsg(null);
      const res = await api.get(`/estadisticas/indicadores/${cargaId}`);
      setIndicadores(res.data);
      setVertical(null);
      setHorizontal(null);
    } catch (error) {
      console.error('Error al obtener indicadores', error);
      setMsg(error.response?.data?.error || 'Error al obtener indicadores');
      setIndicadores(null);
    }
  };

  const obtenerVertical = async () => {
    try {
      setMsg(null);
      const res = await api.get(`/estadisticas/vertical/${cargaId}`);
      setVertical(res.data);
      setIndicadores(null);
      setHorizontal(null);
    } catch (error) {
      console.error('Error al obtener vertical', error);
      setMsg(error.response?.data?.error || 'Error al obtener análisis vertical');
      setVertical(null);
    }
  };

  const obtenerHorizontal = async () => {
    try {
      setMsg(null);
      const res = await api.get(`/estadisticas/horizontal`, {
        params: { actual: cargaId, anterior: anteriorId }
      });
      setHorizontal(res.data);
      setIndicadores(null);
      setVertical(null);
    } catch (error) {
      console.error('Error al obtener horizontal', error);
      setMsg(error.response?.data?.error || 'Error al obtener análisis horizontal');
      setHorizontal(null);
    }
  };

  const limpiarResultados = () => {
    setIndicadores(null);
    setVertical(null);
    setHorizontal(null);
    setMsg(null);
  };

  const renderTable = (data, title) => (
    <div className={styles.tableContainer}>
      <h3>{title}</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{typeof value === 'number' ? value.toFixed(2) + '%' : value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.estadisticas}>
      <SidebarMenu />
      <NavbarMenu />

      <h2>Estadísticas Financieras</h2>

      {/* Mensaje de error o información */}
      {msg && (
        <div className={styles.msgError}>
          {msg}
        </div>
      )}

      <div className={styles['form-group']}>
        <label>ID Actual:</label>
        <input
          type="number"
          value={cargaId}
          onChange={(e) => setCargaId(e.target.value)}
        />
      </div>

      <div className={styles['form-group']}>
        <label>ID Anterior (solo para horizontal):</label>
        <input
          type="number"
          value={anteriorId}
          onChange={(e) => setAnteriorId(e.target.value)}
        />
      </div>

      <div className={styles['button-group']}>
        <button onClick={obtenerIndicadores}>Ver Indicadores</button>
        <button onClick={obtenerVertical}>Análisis Vertical</button>
        <button onClick={obtenerHorizontal}>Análisis Horizontal</button>
        <button className={styles.clearButton} onClick={limpiarResultados}>
          Limpiar Resultados
        </button>
      </div>

      <div className={styles.resultados}>
        {indicadores && renderTable(indicadores, 'Indicadores')}

        {vertical && (
          <>
            {vertical.vertical_balance && renderTable(vertical.vertical_balance, 'Análisis Vertical - Balance')}
            {vertical.vertical_resultados && renderTable(vertical.vertical_resultados, 'Análisis Vertical - Resultados')}
          </>
        )}

        {horizontal && (
          <>
            {horizontal.horizontal_balance && renderTable(horizontal.horizontal_balance, 'Análisis Horizontal - Balance')}
            {horizontal.horizontal_resultados && renderTable(horizontal.horizontal_resultados, 'Análisis Horizontal - Resultados')}
          </>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;
