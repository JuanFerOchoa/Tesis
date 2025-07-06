import React, { useEffect, useState } from 'react';
import styles from '../../styles/pages/Admin.module.scss';
import api from '../../services/api';


const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const response = await api.get('/usuario/');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handleEditar = (usuario) => {
    setEditando(usuario.usuario_id);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      email: usuario.email
    });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await api.delete(`/usuario/${id}`);
      obtenerUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const handleGuardar = async () => {
    try {
      await api.put(`/usuario/${editando}`, formData);
      setEditando(null);
      obtenerUsuarios();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.appContainer}>
      {/* <SidebarMenu />
      <NavbarMenu /> */}

      <div className={styles.mainWrapper}>
        <h1 className={styles.title}>Gestión de Usuarios</h1>

        <div className={styles.tableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.usuario_id}>
                  <td>
                    {editando === usuario.usuario_id ? (
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    ) : (
                      usuario.nombre
                    )}
                  </td>
                  <td>
                    {editando === usuario.usuario_id ? (
                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    ) : (
                      usuario.apellido
                    )}
                  </td>
                  <td>
                    {editando === usuario.usuario_id ? (
                      <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    ) : (
                      usuario.telefono
                    )}
                  </td>
                  <td>
                    {editando === usuario.usuario_id ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    ) : (
                      usuario.email
                    )}
                  </td>
                  <td>{usuario.rol}</td>
                  <td className={styles.actions}>
                    {editando === usuario.usuario_id ? (
                      <>
                        <button className={styles.saveBtn} onClick={handleGuardar}>
                          <span className="material-symbols-outlined">check</span>
                        </button>
                        <button className={styles.cancelBtn} onClick={() => setEditando(null)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className={styles.editBtn} onClick={() => handleEditar(usuario)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleEliminar(usuario.usuario_id)}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;