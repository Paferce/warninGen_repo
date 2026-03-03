import React from 'react';

function TestApp() {
    return (
        <div style={{
            padding: '50px',
            backgroundColor: '#f0f0f0',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ color: '#00587C', fontSize: '48px' }}>
                 React está funcionando!
            </h1>
            <p style={{ fontSize: '24px', marginTop: '20px' }}>
                Si ves este mensaje, React se está montando correctamente.
            </p>
            <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2>Información de diagnóstico:</h2>
                <ul>
                    <li>React:  Funcionando</li>
                    <li>JavaScript:  Funcionando</li>
                    <li>Estilos inline:  Funcionando</li>
                </ul>
            </div>
        </div>
    );
}

export default TestApp;
