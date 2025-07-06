import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import api from '../../services/api';
import SidebarMenu from '../../components/MenuLateral';
import NavbarMenu from '../../components/navbar';

import styles from '../../styles/pages/Dashboard.module.scss';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const res = await api.get('/dashboard/datos');
        setDatos(res.data);
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando estadísticas...</p>
    </div>
  );
  
  if (error) return (
    <div className={styles.errorContainer}>
      <p>Error: {error}</p>
    </div>
  );

  // Datos para los gráficos
  const barChartData = {
    labels: ['Empresas', 'Usuarios', 'Cargas', 'Análisis'],
    datasets: [
      {
        label: 'Totales',
        data: [
          datos.total_empresas,
          datos.total_usuarios,
          datos.total_cargas,
          datos.total_analisis
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['Fraudes Detectados', 'No Fraude'],
    datasets: [
      {
        data: [datos.fraudes_detectados, datos.total_analisis - datos.fraudes_detectados],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Preparar datos para el gráfico de línea (últimos análisis)
  const lastAnalyses = datos.ultimos_analisis.slice(0, 7).reverse();
  const lineChartData = {
    labels: lastAnalyses.map(item => new Date(item.analizado_en).toLocaleDateString()),
    datasets: [
      {
        label: 'Probabilidad de Fraude',
        data: lastAnalyses.map(item => item.probabilidad_fraude),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  return (

    <div className={styles.dashboardWrapper}>
    <SidebarMenu />
    <NavbarMenu />
    
    <div className={styles.dashboardContainer}>
      
      <div className={styles.mainContent}>
        
        <div className={styles.header}>
          <h2>Dashboard Financiero</h2>
          <div className={styles.lastUpdated}>Última actualización: {new Date().toLocaleString()}</div>
        </div>

        {/* Sección de métricas */}
        <div className={styles.metricsContainer}>
          <div className={`${styles.metricCard} ${styles.primary}`}>
            <div className={styles.metricValue}>{datos.total_empresas}</div>
            <div className={styles.metricLabel}>Total Empresas</div>
            <div className={styles.metricIcon}>🏢</div>
          </div>

          <div className={`${styles.metricCard} ${styles.secondary}`}>
            <div className={styles.metricValue}>{datos.total_usuarios}</div>
            <div className={styles.metricLabel}>Total Usuarios</div>
            <div className={styles.metricIcon}>👥</div>
          </div>

          <div className={`${styles.metricCard} ${styles.success}`}>
            <div className={styles.metricValue}>{datos.total_cargas}</div>
            <div className={styles.metricLabel}>Cargas Financieras</div>
            <div className={styles.metricIcon}>📊</div>
          </div>

          <div className={`${styles.metricCard} ${styles.warning}`}>
            <div className={styles.metricValue}>{datos.total_analisis}</div>
            <div className={styles.metricLabel}>Análisis Realizados</div>
            <div className={styles.metricIcon}>🔍</div>
          </div>

          <div className={`${styles.metricCard} ${styles.danger}`}>
            <div className={styles.metricValue}>{datos.fraudes_detectados}</div>
            <div className={styles.metricLabel}>Fraudes Detectados</div>
            <div className={styles.metricSubLabel}>{datos.porcentaje_fraude}% del total</div>
            <div className={styles.metricIcon}>⚠️</div>
          </div>
        </div>

        {/* Sección de gráficos */}
        <div className={styles.chartsContainer}>
          <div className={styles.chartCard}>
            <h3>Resumen General</h3>
            <div className={styles.chartWrapper}>
              <Bar 
                data={barChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }} 
              />
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3>Distribución de Fraudes</h3>
            <div className={styles.chartWrapper}>
              <Pie 
                data={pieChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            </div>
          </div>
        </div>

        <div className={styles.fullWidthChart}>
          <div className={`${styles.chartCard} ${styles.tendenciaChartCard}`}>
            <h3>Tendencia de Probabilidad de Fraude (Últimos 7 análisis)</h3>
            <div className={styles.chartWrapper}>
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 1
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Sección de tabla */}
        <div className={styles.tableContainer}>
          <h3>Últimos Análisis de Fraude</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID Resultado</th>
                  <th>ID Carga</th>
                  <th>Analizado Por</th>
                  <th>Fraude</th>
                  <th>Probabilidad</th>
                  <th>Fecha Análisis</th>
                </tr>
              </thead>
              <tbody>
                {datos.ultimos_analisis.map(item => (
                  <tr key={item.resultado_id} className={item.es_fraude ? styles.fraudRow : ''}>
                    <td>{item.resultado_id}</td>
                    <td>{item.carga_id}</td>
                    <td>Usuario {item.analizado_por}</td>
                    <td>
                      <span className={`${styles.fraudBadge} ${item.es_fraude ? styles.fraud : styles.noFraud}`}>
                        {item.es_fraude ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td>{item.probabilidad_fraude.toFixed(4)}</td>
                    <td>{new Date(item.analizado_en).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;