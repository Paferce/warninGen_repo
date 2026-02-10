import React from 'react';
import { CheckCircle } from 'lucide-react';

const AlertApproval = ({
    alertasPendientes,
    setAlertasPendientes,
    aprobacionRequerida,
    setAprobacionRequerida,
    registrarActividad
}) => {

    // Aprobar alerta pendiente
    const aprobarAlerta = async (alertaId) => {
        const alerta = alertasPendientes.find(a => a.id === alertaId);
        if (!alerta) return;

        try {
            // Enviar alerta al backend
            const token = localStorage.getItem('token');
            const response = await fetch('/api/enviar-alerta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contactos: alerta.contactos,
                    tipo_alerta: alerta.tipo_alerta,
                    canales: alerta.canales,
                    plantillas: alerta.plantillas,
                    variables: alerta.variables
                })
            });

            const resultado = await response.json();

            if (resultado.exito) {
                // Eliminar de pendientes
                const nuevasAlertasPendientes = alertasPendientes.filter(a => a.id !== alertaId);
                setAlertasPendientes(nuevasAlertasPendientes);
                localStorage.setItem('alertasPendientes', JSON.stringify(nuevasAlertasPendientes));

                // Registrar actividad
                registrarActividad(
                    `Aprobó alerta tipo ${alerta.tipo_alerta} de ${alerta.operador}`,
                    'alertas',
                    'aprobar',
                    {
                        tipo_alerta: alerta.tipo_alerta,
                        operador: alerta.operador,
                        contactos: alerta.contactos.length,
                        exitosos: resultado.resultados.resumen.exitosos,
                        fallidos: resultado.resultados.resumen.fallidos
                    }
                );

                const { exitosos, fallidos } = resultado.resultados.resumen;
                alert(`Alerta aprobada y enviada:\n${exitosos} exitosos\n${fallidos} fallidos`);
            } else {
                alert('Error al enviar la alerta: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error('Error al aprobar alerta:', error);
            alert('Error al aprobar alerta: ' + error.message);
        }
    };

    // Rechazar alerta pendiente
    const rechazarAlerta = (alertaId) => {
        if (!window.confirm('¿Seguro que deseas rechazar esta alerta?')) return;

        const alerta = alertasPendientes.find(a => a.id === alertaId);
        if (!alerta) return;

        // Eliminar de pendientes
        const nuevasAlertasPendientes = alertasPendientes.filter(a => a.id !== alertaId);
        setAlertasPendientes(nuevasAlertasPendientes);
        localStorage.setItem('alertasPendientes', JSON.stringify(nuevasAlertasPendientes));

        // Registrar actividad
        registrarActividad(
            `Rechazó alerta tipo ${alerta.tipo_alerta} de ${alerta.operador}`,
            'alertas',
            'rechazar',
            {
                tipo_alerta: alerta.tipo_alerta,
                operador: alerta.operador,
                contactos: alerta.contactos.length
            }
        );

        alert('Alerta rechazada correctamente');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Aprobar Alertas</h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Sistema de aprobación:
                        <span className={`ml-2 font-semibold ${aprobacionRequerida ? 'text-green-600' : 'text-red-600'}`}>
                            {aprobacionRequerida ? 'Activado' : 'Desactivado'}
                        </span>
                    </span>
                    <button
                        onClick={() => {
                            const nuevoEstado = !aprobacionRequerida;
                            setAprobacionRequerida(nuevoEstado);
                            localStorage.setItem('aprobacionRequerida', JSON.stringify(nuevoEstado));
                            alert(`Sistema de aprobación ${nuevoEstado ? 'activado' : 'desactivado'}`);
                        }}
                        className={`px-4 py-2 rounded-lg transition ${aprobacionRequerida
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {aprobacionRequerida ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>

            {!aprobacionRequerida && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                        El sistema de aprobación está desactivado. Los operadores pueden enviar alertas directamente sin aprobación.
                    </p>
                </div>
            )}

            {alertasPendientes.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                    <CheckCircle className="mx-auto text-gray-400 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay alertas pendientes</h3>
                    <p className="text-gray-600">Todas las alertas han sido procesadas</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alertasPendientes.map((alerta) => (
                        <div key={alerta.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Alerta {alerta.tipo_alerta}
                                        </h3>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">
                                            Pendiente
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Creada por: <strong>{alerta.operador}</strong>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Fecha: {new Date(alerta.fecha_creacion).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Canales:</p>
                                    <div className="flex gap-2">
                                        {Object.keys(alerta.canales).filter(c => alerta.canales[c]).map(canal => (
                                            <span key={canal} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                {canal}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Destinatarios:</p>
                                    <p className="text-sm text-gray-600">{alerta.contactos.length} contactos</p>
                                </div>
                            </div>

                            {alerta.variables.fecha_hora && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700">Variables:</p>
                                    <p className="text-sm text-gray-600">Fecha/Hora: {alerta.variables.fecha_hora}</p>
                                    {alerta.variables.fenomeno && (
                                        <p className="text-sm text-gray-600">Fenómeno: {alerta.variables.fenomeno}</p>
                                    )}
                                </div>
                            )}

                            <div className="border-t pt-4 mt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Preview del mensaje:</p>
                                {Object.keys(alerta.plantillas).map(canal => {
                                    const plantilla = alerta.plantillas[canal];
                                    let mensajePreview = plantilla.mensaje;

                                    // Sustituir variables
                                    Object.keys(alerta.variables).forEach(key => {
                                        const regex = new RegExp(`{{${key}}}`, 'g');
                                        mensajePreview = mensajePreview.replace(regex, alerta.variables[key]);
                                    });

                                    if (alerta.contactos[0]) {
                                        mensajePreview = mensajePreview.replace(/{{nombre}}/g, alerta.contactos[0].nombre);
                                        mensajePreview = mensajePreview.replace(/{{tipo_punto_critico}}/g, alerta.contactos[0].tipo_punto_critico);
                                    }

                                    return (
                                        <div key={canal} className="mb-3 last:mb-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-1 text-xs rounded ${canal === 'email' ? 'bg-blue-100 text-blue-700' :
                                                    canal === 'sms' ? 'bg-green-100 text-green-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {canal}
                                                </span>
                                                {canal === 'email' && plantilla.asunto && (
                                                    <span className="text-sm text-gray-600">
                                                        Asunto: {plantilla.asunto}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                                    {mensajePreview.substring(0, 200)}
                                                    {mensajePreview.length > 200 && '...'}
                                                </pre>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => aprobarAlerta(alerta.id)}
                                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} />
                                    Aprobar y Enviar
                                </button>
                                <button
                                    onClick={() => rechazarAlerta(alerta.id)}
                                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlertApproval;
