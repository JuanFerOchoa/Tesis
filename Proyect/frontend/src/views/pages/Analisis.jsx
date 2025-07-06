import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SidebarMenu from '../../components/MenuLateral';
import NavbarMenu from '../../components/navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import styles from '../../styles/pages/Analisis.module.scss';

const Analisis = () => {
  const [cargas, setCargas] = useState([]);
  const [cargaSeleccionada, setCargaSeleccionada] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        const res = await api.get('/cargas');
        setCargas(res.data);
      } catch (error) {
        console.error('Error al obtener cargas:', error);
      }
    };
    fetchCargas();
  }, []);

  const analizarFraude = async () => {
    if (!cargaSeleccionada) return;
    setLoading(true);
    try {
      const res = await api.get(`/analizar_fraude/${cargaSeleccionada}`);
      setResultado(res.data);
    } catch (error) {
      console.error('Error al analizar fraude:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarReportePDF = () => {
    if (!resultado) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Análisis de Fraude Financiero', 20, 20);

    doc.setFontSize(12);
    doc.text(`ID de carga analizada: ${cargaSeleccionada}`, 20, 30);
    doc.text(`Resultado del análisis: ${resultado.resultado_fraude}`, 20, 40);

    doc.setFontSize(12);
    doc.text('Indicadores financieros analizados:', 20, 50);

    const rows = Object.entries(resultado.indicadores).map(([key, value]) => [
      key,
      value !== null ? value.toFixed(4) : 'N/A',
      obtenerInterpretacionIndicador(key, value),
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Indicador', 'Valor', 'Interpretación']],
      body: rows,
    });

    doc.save(`reporte_fraude_${cargaSeleccionada}.pdf`);
  };

  // Interpretación inteligente por palabras clave
  const obtenerInterpretacionIndicador = (key, value) => {
    if (value === null) return 'Sin datos';

    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('liquidez')) {
      if (value < 1) return 'Alerta: posible iliquidez';
      if (value >= 1 && value <= 2) return 'Liquidez aceptable';
      return 'Buena liquidez';
    }

    if (lowerKey.includes('prueba')) {
      if (value < 1) return 'Posible falta de activos líquidos';
      return 'Buen nivel de activos líquidos';
    }

    if (lowerKey.includes('endeudamiento') || lowerKey.includes('deuda')) {
      if (value > 1) return 'Alto endeudamiento: riesgo financiero';
      return 'Nivel de deuda controlado';
    }

    if (lowerKey.includes('margen')) {
      if (value < 0.05) return 'Margen muy bajo: posible pérdida o baja rentabilidad';
      return 'Rentabilidad aceptable';
    }

    return 'Sin interpretación';
  };

  return (
    <div className="d-flex">
      <SidebarMenu />
      <div className="flex-grow-1">
        <NavbarMenu />
        <div className={styles.container}>
          <h2>Análisis de Fraude Financiero</h2>

          <label htmlFor="cargaSelect">Selecciona un archivo financiero:</label>
          <select
            id="cargaSelect"
            className={styles.select}
            value={cargaSeleccionada}
            onChange={(e) => setCargaSeleccionada(e.target.value)}
          >
            <option value="">-- Selecciona una carga --</option>
            {cargas.map((carga) => (
              <option key={carga.id} value={carga.id}>
                {carga.id} - {carga.archivo}
              </option>
            ))}
          </select>

          <button
            className={styles.btnAnalizar}
            onClick={analizarFraude}
            disabled={!cargaSeleccionada || loading}
          >
            {loading ? 'Analizando...' : 'Analizar Fraude'}
          </button>

          {resultado && (
            <div className={styles.resultado}>
              <h4>
                Resultado:{' '}
                <span
                  className={`badge ${
                    resultado.resultado_fraude === 'FRAUDE'
                      ? 'bg-danger'
                      : 'bg-success'
                  }`}
                >
                  {resultado.resultado_fraude}
                </span>
              </h4>
              <h5>Indicadores:</h5>
              <ul>
                {Object.entries(resultado.indicadores).map(([key, value]) => (
                  <li key={key}>
                    <span>{key}</span>
                    <span>{value !== null ? value.toFixed(4) : 'N/A'}</span>
                  </li>
                ))}
              </ul>

              <button
                className={styles.btnAnalizar}
                onClick={generarReportePDF}
              >
                Generar Reporte PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analisis;
