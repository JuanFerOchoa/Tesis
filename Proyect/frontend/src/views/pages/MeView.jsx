import React, { useEffect, useState } from 'react';
import api from '../../services/api';

import styles from '../../styles/pages/perfil.module.scss';

import SidebarMenu from '../../components/MenuLateral';
import NavbarMenu from '../../components/navbar';



export default function MeView() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setErr('No autorizado'));
  }, []);

  if (err) return <p>{err}</p>;
  if (!user) return <p>Cargando...</p>;

  return (

    <div className={styles.appContainer}>
       <SidebarMenu />
       <NavbarMenu />
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <h1>{user.nombre} {user.apellido}</h1>
              <p className={styles.username}>{user.email}</p>
            </div>

            <div className={styles.profileImage}>
              <img src="https://via.placeholder.com/120" alt="Foto de perfil" />
            </div>

            <div className={styles.separator}></div>

            <div className={styles.uploadSection}>
              <h2>Subir nueva foto</h2>
              <p className={styles.uploadInfo}>
                Sube un nuevo avatar. Las imágenes más grandes se redimensionarán automáticamente. El tamaño máximo de subida es de <strong>1 MB</strong>
              </p>
              <button className={styles.uploadBtn}>SUBIR NUEVA FOTO</button>
            </div>

            <div className={styles.memberSinceContainer}>
              <p className={styles.memberSince}>Miembro desde: {new Date(user.creado_en).toLocaleDateString()}</p>
            </div>

            <div className={styles.separator}></div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <h1>EDITAR PERFIL</h1>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Información de Personal </h3>
              <p className={styles.sectionSubtitle}>Información de Empresarial</p>
            </div>
            <div className={styles.sectionUnderline}></div>

            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Nombre</label>
                  <input type="text" value={user.nombre} disabled />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Cédula</label>
                  <input type="text" value={user.cedula} disabled />
                </div>
                 <div className={styles.formGroup}>
                  <label>Teléfono</label>
                  <input type="text" value={user.telefono} disabled />
                </div>
              </div>


              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Apellido</label>
                  <input type="text" value={user.apellido} disabled />
                </div>
                <div className={styles.formGroup}>
                  <label>Correo electrónico</label>
                  <input type="email" value={user.email} className={styles.highlighted} disabled />
                </div>
                <div className={styles.formGroup}>
                  <label>Rol</label>
                  <input type="text" value={user.rol} className={styles.highlighted} disabled />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.separator}></div>

          <div className={styles.section}>
            <h3>Perfil social</h3>
            <div className={styles.formGroup}>
              <label>Usuario de Facebook</label>
              <input type="text" />
            </div>
            <div className={styles.formGroup}>
              <label>Usuario de Twitter</label>
              <input type="text" />
            </div>
          </div>

          <button type="submit" className={styles.updateBtn}>Actualizar información</button>
        </div>
      </div>
    </div>
  );
}
