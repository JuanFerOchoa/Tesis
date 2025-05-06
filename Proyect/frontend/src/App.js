import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';

import RegisterView from './views/RegisterView';
import LoginView    from './views/LoginView';
import MeView       from './views/MeView';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/register">Registro</Link> | <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/"        element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/login"    element={<LoginView />} />
        <Route path="/me"       element={<MeView />} />
        <Route path="*"         element={<h2>404 Página no encontrada</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

