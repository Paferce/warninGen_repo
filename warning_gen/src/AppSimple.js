import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function AppSimple() {
    const [usuario, setUsuario] = useState(null);

    return (
        <Router>
            <div style={{ padding: '50px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
                <h1 style={{ color: '#00587C' }}>Sistema de Alertas - Versión Simple</h1>

                <Routes>
                    <Route path="/" element={
                        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
                            <h2>Página de Login</h2>
                            <p>Si ves esto, el router está funcionando correctamente.</p>
                            <button
                                onClick={() => setUsuario({ nombre: 'Test User' })}
                                style={{ padding: '10px 20px', backgroundColor: '#00587C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Simular Login
                            </button>
                        </div>
                    } />

                    <Route path="/dashboard" element={
                        usuario ? (
                            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
                                <h2>Dashboard</h2>
                                <p>Bienvenido, {usuario.nombre}!</p>
                            </div>
                        ) : (
                            <Navigate to="/" />
                        )
                    } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default AppSimple;
