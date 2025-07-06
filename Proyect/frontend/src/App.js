import React from 'react';
import { BrowserRouter, Routes, Route,  Navigate } from 'react-router-dom';

import RegisterView from './views/RegisterView';
import LoginView    from './views/LoginView';
import MeView       from './views/pages/MeView';
import HomeView      from './views/pages/HomeView';
import CompletarPerfil  from './views/FormularioIngreso';
import LoginSuccess from './views/pages/LoginSuccess';
import Usuarios from './views/pages/usuarios'
import RecuperarPassword from './views/reset_password/RecuperarPassword';
import ResetPassword from './views/reset_password/ResetPassword';
import Archivo from './views/pages/Archivo';
import UploadArchivo from './views/pages/UploadArchivo';
import Estadisticas from './views/pages/Estadisticas'; 
import Analisis from './views/pages/Analisis'; 
import Dashboard from './views/pages/Dashboard'; 


function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/login"    element={<LoginView />} />
        <Route path="/perfil"       element={<MeView />} />
        <Route path="/inicio"       element={<Dashboard />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="*"         element={<h2>404 Página no encontrada</h2>} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/usuarios" element={<Usuarios />} />

        <Route path="/recuperarcontrasena" element={<RecuperarPassword/>} />
        <Route path="/resetcontrasena" element={<ResetPassword/>} />

        

        <Route path="/carga_A" element={<UploadArchivo/>} />
        <Route path="/archivo/:cargaId" element={<Archivo />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/analisis" element={<Analisis />} />
        <Route path="/dashboard" element={<Dashboard />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;

