import React, { useEffect, useState } from 'react';
import api from '../services/api';

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
    <div>
      <h2>Perfil</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
