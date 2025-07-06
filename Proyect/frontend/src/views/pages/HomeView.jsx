import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/pages/inicio.module.scss';

function SidebarMenu() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const profileMenuRef = useRef(null); 

   const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  const toggleMenu = () => setShowMenu(!showMenu);

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

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !event.target.closest(`#profile-icon`)
      ) {
        setShowMenu(false);
      }
       
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    
    <div className={styles.container}>

     <div className={styles.headerIconsContainer}>
      <div className={styles.headerIcons}>
        
      <div className={styles.menuIcon}>
        <ion-icon name="apps-outline"></ion-icon>
      </div>


    <div className={styles.searchContainer}>
      <input type="text" placeholder="Buscar..." className={styles.searchInput} />
      <i className="ri-search-line"></i>
    </div>


    <div className={styles.iconGroup}>
      <div className={styles.tooltip}>
        <i className="ri-question-line"></i>
        <span className={styles.tooltiptext}>Preguntas</span>
      </div>

      <div className={styles.tooltip}>
        <i className="ri-message-3-line"></i>
        <span className={styles.tooltiptext}>Mensajes</span>
      </div>
  
      <div className={styles.tooltip}>
        <i className="ri-notification-3-line"></i>
        <span className={styles.tooltiptext}>Notificaciones</span>
      </div>
      <div className={styles.tooltip} onClick={toggleMenu}>
        <div className={styles.headerProfile} id="profile-icon">
          <img src="assets/img/perfil.png" alt="Perfil" />
        </div>
        <span className={styles.tooltiptext}>Perfil</span>
      </div>
    </div>

  </div>

      {showMenu && (
        <div className={styles.profileMenu} ref={profileMenuRef}>
          <div className={styles.profileTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "perfil" ? styles.active : ""}`}
              onClick={() => setActiveTab("perfil")}
            >
              Perfil
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "configuracion" ? styles.active : ""}`}
              onClick={() => setActiveTab("configuracion")}
            >
              Configuración
            </button>
          </div>

          <div className={`${styles.tabContent} ${activeTab === "perfil" ? styles.active : ""}`}>
            <ul>
              <li><i className="ri-user-line"></i> Ver perfil</li>
              <li><i className="ri-edit-line"></i> Editar información</li>
              <li><i className="ri-lock-line"></i> Cambiar contraseña</li>
            </ul>
          </div>

          <div className={`${styles.tabContent} ${activeTab === "configuracion" ? styles.active : ""}`}>
            <ul>
              <li><i className="ri-settings-3-line"></i> Preferencias</li>
              <li><i className="ri-notification-line"></i> Notificaciones</li>
              <li><i className="ri-logout-box-line"></i> Cerrar sesión</li>
            </ul>
          </div>
        </div>
      )}
    </div>

      <button
        ref={toggleButtonRef}
        onClick={toggleSidebar}
        className={styles.mostrar__menu}
      >
        <i className="fas fa-bars"></i>
      </button>


      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${
          isSidebarExpanded ? styles.showSidebar : styles.collapsedSidebar
        }`}
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
                 <Link to="#" className={`${styles.sidebar__link} ${styles.activeLink}`} title={!isSidebarExpanded ? 'Panel' : ''}>
                    <i className="fas fa-chart-pie"></i>
                    {isSidebarExpanded && <span>Panel</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Análisis de Transacciones' : ''}>
                    <i className="fas fa-exchange-alt"></i>
                    {isSidebarExpanded && <span>Análisis de Transacciones</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Análisis de Documentos' : ''}>
                    <i className="fas fa-file-alt"></i>
                    {isSidebarExpanded && <span>Análisis de Documentos</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Calendario' : ''}>
                    <i className="fas fa-calendar-alt"></i>
                    {isSidebarExpanded && <span>Calendario</span>}
                  </Link>
                  
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Estadísticas' : ''}>
                    <i className="fas fa-chart-bar"></i>
                    {isSidebarExpanded && <span>Estadísticas</span>}
                  </Link>
                </div>
              </div>

              <div>
                <h3 className={styles.sidebar__title}>
                  {isSidebarExpanded ? 'AJUSTES' : 'AJT'}
                </h3>
                <div className={styles.sidebar__list}>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Configuración' : ''}>
                    <i className="fas fa-cogs"></i>
                    {isSidebarExpanded && <span>Configuración</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Historial' : ''}>
                    <i className="fas fa-envelope-open-text"></i>
                    {isSidebarExpanded && <span>Mis Mensajes</span>}
                  </Link>
                  <Link to="#" className={styles.sidebar__link} title={!isSidebarExpanded ? 'Notificaciones' : ''}>
                    <i className="fas fa-bell"></i>
                    {isSidebarExpanded && <span>Notificaciones</span>}
                  </Link>
                </div>
              </div>
            </div>

 
            <div className={styles.sidebar__actions}>
              <button className={styles.sidebar__link} title={!isSidebarExpanded ? 'Tema' : ''}>
                <i className="fas fa-moon"></i>
                {isSidebarExpanded && <span>Tema</span>}
              </button>
              <button className={styles.sidebar__link} title={!isSidebarExpanded ? 'Cerrar Sesión' : ''}>
                <i className="fas fa-sign-out-alt"></i>
                {isSidebarExpanded && <span>Cerrar Sesión</span>}
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </div>
  );
}

export default SidebarMenu;
