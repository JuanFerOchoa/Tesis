import { useRef, useEffect, useState } from 'react';
import api from '../services/api'; 
import styles from '../components/navbar.module.scss';
import { Link } from 'react-router-dom';

function NavbarMenu() {
  const profileMenuRef = useRef(null);
  const notiMenuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  const [showNoti, setShowNoti] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidasCount, setNoLeidasCount] = useState(0);

  const toggleMenu = () => setShowMenu(!showMenu);
  const toggleNoti = () => setShowNoti(!showNoti);


  const obtenerUsuarioIdDelToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.usuario_id;
    } catch {
      return null;
    }
  };
  const usuarioId = obtenerUsuarioIdDelToken();

  useEffect(() => {
    // Cerrar menús si clic fuera
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !event.target.closest('#profile-icon')
      ) {
        setShowMenu(false);
      }

      if (
        notiMenuRef.current &&
        !notiMenuRef.current.contains(event.target) &&
        !event.target.closest('#noti-icon')
      ) {
        setShowNoti(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!usuarioId) return;
    api.get(`/notificaciones/${usuarioId}`)
      .then(({ data }) => {
        setNotificaciones(data);
        setNoLeidasCount(data.filter(n => !n.leido).length);
      })
      .catch(err => {
        console.error('Error cargando notificaciones:', err);
      });
  }, [usuarioId]);

  const marcarComoLeida = (id) => {
    api.post(`/notificaciones/${id}/leer`)
      .then(() => {
        setNotificaciones((prev) =>
          prev.map(n => (n.id === id ? { ...n, leido: true } : n))
        );
        setNoLeidasCount(prev => (prev > 0 ? prev - 1 : 0));
      })
      .catch(err => {
        console.error('Error al marcar notificación leída:', err);
      });
  };

  return (
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

          <div
            className={styles.tooltip}
            onClick={toggleNoti}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <i id="noti-icon" className="ri-notification-3-line" style={{ fontSize: 24 }}></i>
            <span className={styles.tooltiptext}>Notificaciones</span>

            {/* Punto o número notificaciones no leídas */}
            {noLeidasCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '0 6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  userSelect: 'none',
                }}
              >
                {noLeidasCount > 9 ? '9+' : noLeidasCount}
              </span>
            )}
          </div>

          <div className={styles.tooltip} onClick={toggleMenu}>
            <div className={styles.headerProfile} id="profile-icon">
              <img src="assets/img/perfil.png" alt="Perfil" />
            </div>
            <span className={styles.tooltiptext}>Perfil</span>
          </div>
        </div>

      </div>

      {/* Menú Perfil */}
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
              <li className={styles.sidebar__link}>
                <Link to="/perfil" className={styles.sidebar__link}>
                  <i className="ri-user-line"></i> Ver perfil
                </Link>
              </li>
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

      {/* Menú Notificaciones */}
      {showNoti && (
        <div
          ref={notiMenuRef}
          style={{
            position: 'absolute',
            right: '10px',
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            borderRadius: '4px',
          }}
        >
          {notificaciones.length === 0 ? (
            <p style={{ padding: '10px' }}>No hay notificaciones</p>
          ) : (
            notificaciones.map(noti => (
              <div
                key={noti.id}
                onClick={() => {
                  if (!noti.leido) marcarComoLeida(noti.id);
                }}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: noti.leido ? 'white' : '#f0f8ff',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
                title={new Date(noti.creado_en).toLocaleString()}
              >
                {noti.mensaje}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NavbarMenu;
