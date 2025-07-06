import { useRef, useEffect, useState } from 'react';
import { Link} from 'react-router-dom';
import styles from '../components/MenuLateral.module.scss';


function SidebarMenu() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);



  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsSidebarExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className={styles.container}>
      <button
        ref={toggleButtonRef}
        onClick={toggleSidebar}
        className={styles.mostrar__menu}
      >
        <i className="fas fa-bars"></i>
      </button>

      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${isSidebarExpanded ? styles.showSidebar : styles.collapsedSidebar}`}
      >
        <nav className={styles.navbar}>
          <div className={styles.sidebar__container}>
            <div className={styles.sidebar__user}>
              {isSidebarExpanded && (
                <div className={styles.sidebar__logo}>
                  <i className="fas fa-user-shield"></i>
                </div>
              )}
            </div>

            <div className={styles.sidebar__content}>
              <div>
                <h3 className={styles.sidebar__title}>
                  {isSidebarExpanded ? 'ADMINISTRAR' : 'ADM'}
                </h3>
                <div className={styles.sidebar__list}>
                  <Link to="/dashboard" className={`${styles.sidebar__link} ${styles.activeLink}`} title={!isSidebarExpanded ? 'Panel' : ''}>
                    <i className="fas fa-chart-pie"></i>
                    {isSidebarExpanded && <span>Panel</span>}
                  </Link>

                  {/* <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Estadísticas' : ''}>
                    <i className="fas fa-chart-bar"></i>
                    {isSidebarExpanded && <span>Estadísticas</span>}
                  </Link> */}

                  {/* <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Análisis de Transacciones' : ''}>
                    <i className="fas fa-exchange-alt"></i>
                    {isSidebarExpanded && <span>Análisis de Transacciones</span>}
                  </Link> */}

                  <Link to="/analisis" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Análisis de Documentos' : ''}>
                    <i className="fas fa-file-alt"></i>
                    {isSidebarExpanded && <span>Análisis de Documentos</span>}
                  </Link>

                  <Link to="/carga_a" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Cargar Archivos' : ''}>
                    <i className="fas fa-upload"></i>
                    {isSidebarExpanded && <span>Cargar Archivos</span>}
                  </Link>

                  <Link to="/estadisticas" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Datos Procesados' : ''}>
                    <i className="fas fa-table"></i>
                    {isSidebarExpanded && <span>Datos Procesados</span>}
                  </Link>
                </div>
              </div>

              <div>
                <h3 className={styles.sidebar__title}>
                  {isSidebarExpanded ? 'AJUSTES' : 'AJT'}
                </h3>
                <div className={styles.sidebar__list}>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Calendario' : ''}>
                    <i className="fas fa-calendar-alt"></i>
                    {isSidebarExpanded && <span>Calendario</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Configuración' : ''}>
                    <i className="fas fa-cogs"></i>
                    {isSidebarExpanded && <span>Configuración</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Historial' : ''}>
                    <i className="fas fa-history"></i>
                    {isSidebarExpanded && <span>Historial</span>}
                  </Link>
                  {/* <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Notificaciones' : ''}>
                    <i className="fas fa-bell"></i>
                    {isSidebarExpanded && <span>Notificaciones</span>}
                  </Link> */}
                </div>
              </div>
            </div>

            <div className={styles.sidebar__actions}>
              <Link
                to="#"
                className={styles.sidebar__link}
                title={!isSidebarExpanded ? 'Tema' : ''}
              >
                <i className="fas fa-moon"></i>
                {isSidebarExpanded && <span>Tema</span>}
              </Link>

              <Link
                to="/login"
                className={styles.sidebar__link}
                title={!isSidebarExpanded ? 'Cerrar Sesión' : ''}
              >
                <i className="fas fa-sign-out-alt"></i>
                {isSidebarExpanded && <span>Cerrar Sesión</span>}
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}

export default SidebarMenu;
