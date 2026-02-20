// PaginaConsentimiento.jsx
// Componente para la página pública de consentimiento
// Ruta: /consentimiento/:token

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';

const PaginaConsentimiento = () => {
  const [estado, setEstado] = useState('cargando'); // cargando, valido, invalido, ya_aceptado, procesando, exitoso, error
  const [datosContacto, setDatosContacto] = useState(null);
  const [terminosUrl, setTerminosUrl] = useState('');
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Obtener token de la URL
  const token = window.location.pathname.split('/').pop();

  const verificarToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/consentimiento/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setEstado('invalido');
        setMensaje(data.error || 'Token inválido');
        return;
      }

      if (data.ya_aceptado) {
        setEstado('ya_aceptado');
        setDatosContacto(data.contacto);
        setMensaje(data.mensaje);
      } else {
        setEstado('valido');
        setDatosContacto(data.contacto);
        setTerminosUrl(data.terminos_url);
      }
    } catch (error) {
      console.error('Error:', error);
      setEstado('error');
      setMensaje('Error al verificar el token');
    }
  }, [token]);

  // Cargar datos al montar componente
  useEffect(() => {
    verificarToken();
  }, [verificarToken]);

  const enviarConsentimiento = async () => {
    if (!aceptoTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    setEstado('procesando');

    try {
      const response = await fetch(`/api/consentimiento/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aceptado: true })
      });

      const data = await response.json();

      if (!response.ok) {
        setEstado('error');
        setMensaje(data.error || 'Error al registrar consentimiento');
        return;
      }

      setEstado('exitoso');
      setMensaje(data.mensaje);
    } catch (error) {
      console.error('Error:', error);
      setEstado('error');
      setMensaje('Error al procesar la solicitud');
    }
  };

  // Renderizado según estado

  if (estado === 'cargando') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', color: '#00587C' }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Verificando...</p>
        </div>
      </div>
    );
  }

  if (estado === 'invalido' || estado === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <AlertTriangle size={64} style={{ color: '#dc2626', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
            Token Inválido
          </h1>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            {mensaje || 'El enlace no es válido o ha expirado. Por favor, solicita un nuevo enlace.'}
          </p>
        </div>
      </div>
    );
  }

  if (estado === 'ya_aceptado') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
            Ya has dado tu consentimiento
          </h1>
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
            {datosContacto?.nombre}, tu WhatsApp ya está activado para recibir notificaciones.
          </p>
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '14px', fontWeight: '500' }}>
              Número registrado: {datosContacto?.telefono}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (estado === 'exitoso') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f7fa',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 20px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px', color: '#1a1a1a' }}>
            ¡Consentimiento Registrado!
          </h1>
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
            Gracias {datosContacto?.nombre}, tu WhatsApp ha sido activado correctamente.
          </p>
          <div style={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #00587C',
            borderRadius: '6px',
            padding: '20px',
            marginTop: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#00587C', fontSize: '16px', fontWeight: '600' }}>
              ¿Qué significa esto?
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568', fontSize: '14px', lineHeight: '1.8' }}>
              <li>Recibirás notificaciones importantes por WhatsApp</li>
              <li>Tu número: {datosContacto?.telefono}</li>
              <li>Puedes revocar el consentimiento en cualquier momento</li>
            </ul>
          </div>
          <p style={{ marginTop: '24px', fontSize: '13px', color: '#9ca3af' }}>
            Recibirás un mensaje de confirmación en breve.
          </p>
        </div>
      </div>
    );
  }

  // Estado: valido (mostrar formulario)
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#00587C',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: 0,
            color: 'white',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            Consentimiento para WhatsApp
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '15px'
          }}>
            Sistema de Notificaciones
          </p>
        </div>

        {/* Contenido */}
        <div style={{ padding: '40px 32px' }}>
          <div style={{
            backgroundColor: '#e0f2fe',
            border: '1px solid #00587C',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <h2 style={{ margin: '0 0 12px 0', color: '#00587C', fontSize: '18px', fontWeight: '600' }}>
              Hola {datosContacto?.nombre},
            </h2>
            <p style={{ margin: 0, color: '#4a5568', lineHeight: '1.6' }}>
              Para activar las notificaciones de WhatsApp, necesitamos tu consentimiento explícito según la normativa vigente.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' }}>
              ¿Qué significa dar mi consentimiento?
            </h3>
            <ul style={{ margin: 0, paddingLeft: '24px', color: '#4a5568', lineHeight: '1.8' }}>
              <li>Recibirás notificaciones importantes por WhatsApp</li>
              <li>Tu número quedará registrado: <strong>{datosContacto?.telefono}</strong></li>
              <li>Solo recibirás mensajes de carácter informativo</li>
              <li>Puedes revocar el consentimiento cuando desees</li>
              <li>Tus datos están protegidos según RGPD</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px', fontWeight: '600' }}>
              Importante:
            </h4>
            <p style={{ margin: 0, color: '#78350f', fontSize: '13px', lineHeight: '1.6' }}>
              Lee los términos y condiciones antes de aceptar. Al dar tu consentimiento, aceptas recibir comunicaciones por WhatsApp.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <a
              href={terminosUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                color: '#00587C',
                textDecoration: 'underline',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Leer Terminos y Condiciones Completos
            </a>
          </div>

          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={aceptoTerminos}
                onChange={(e) => setAceptoTerminos(e.target.checked)}
                style={{
                  marginTop: '4px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: '#1a1a1a', lineHeight: '1.6' }}>
                He leído y acepto los <strong>términos y condiciones</strong> para recibir notificaciones por WhatsApp.
                Entiendo que puedo revocar este consentimiento en cualquier momento.
              </span>
            </label>
          </div>

          <button
            onClick={enviarConsentimiento}
            disabled={!aceptoTerminos || estado === 'procesando'}
            style={{
              width: '100%',
              backgroundColor: aceptoTerminos ? '#00587C' : '#9ca3af',
              color: 'white',
              padding: '16px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: aceptoTerminos ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: estado === 'procesando' ? 0.7 : 1
            }}
          >
            {estado === 'procesando' ? 'Procesando...' : 'Confirmar Consentimiento'}
          </button>

          <p style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#9ca3af',
            lineHeight: '1.6'
          }}>
            Al confirmar, recibirás un mensaje de confirmación por email y SMS.<br />
            Para más información: info@tuinstitucion.es
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaginaConsentimiento;
