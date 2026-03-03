import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, Mail, Phone, MessageSquare,
    CheckCircle
} from 'lucide-react';

const CreateAlert = ({
    plantillas,
    contactos,
    usuario,
    tiposAlerta,
    onVolver,
    registrarActividad,
    aprobacionRequerida,
    setAlertasPendientes,
    alertasPendientes,
    setAlertasProgramadas,
    alertasProgramadas
}) => {
    // Estado del flujo de alerta
    const [flujoAlerta, setFlujoAlerta] = useState({
        paso: 1,  // 1: Tipo, 2: Canales, 3: Plantillas, 4: Variables, 5: Contactos, 6: Programación, 7: Preview
        tipoAlerta: null,
        canales: { email: false, sms: false, whatsapp: false },
        plantillasSeleccionadas: { email: null, sms: null, whatsapp: null },
        contactosSeleccionados: [],
        variables: {},
        preview: null,
        programacion: {
            inmediata: true,
            programada: { activa: false, fechaHora: '' },
            recurrente: { activa: false, intervalo: 1, unidad: 'horas', fechaInicio: '', fechaFin: '' }
        }
    });

    // Toggle canal
    const toggleCanal = (canal) => {
        setFlujoAlerta({
            ...flujoAlerta,
            canales: {
                ...flujoAlerta.canales,
                [canal]: !flujoAlerta.canales[canal]
            }
        });
    };

    // Generar preview
    const generarPreview = () => {
        const previews = {};

        Object.keys(flujoAlerta.canales).forEach(canal => {
            if (flujoAlerta.canales[canal] && flujoAlerta.plantillasSeleccionadas[canal]) {
                const plantilla = plantillas.find(
                    p => p.id === flujoAlerta.plantillasSeleccionadas[canal]
                );

                if (plantilla) {
                    let mensaje = plantilla.mensaje;
                    let asunto = plantilla.asunto || '';

                    // Sustituir variables
                    Object.keys(flujoAlerta.variables).forEach(varName => {
                        const regex = new RegExp(`{{${varName}}}`, 'g');
                        mensaje = mensaje.replace(regex, flujoAlerta.variables[varName]);
                        asunto = asunto.replace(regex, flujoAlerta.variables[varName]);
                    });

                    previews[canal] = { asunto, mensaje };
                }
            }
        });

        setFlujoAlerta({ ...flujoAlerta, preview: previews, paso: 7 });
    };

    // Enviar alertas (lógica principal)
    const enviarAlertas = async () => {
        if (flujoAlerta.contactosSeleccionados.length === 0) {
            alert('Seleccione al menos un contacto');
            return;
        }

        // Verificar si hay programaciones
        const tieneProgramaciones = flujoAlerta.programacion.programada.activa || flujoAlerta.programacion.recurrente.activa;

        // Lógica para alertas programadas
        if (tieneProgramaciones) {
            const contactosEnvio = contactos.filter(c => flujoAlerta.contactosSeleccionados.includes(c.id));
            const plantillasAlerta = {};

            Object.keys(flujoAlerta.canales).forEach(canal => {
                if (flujoAlerta.canales[canal]) {
                    const plantillaId = flujoAlerta.plantillasSeleccionadas[canal];
                    const plantilla = plantillas.find(p => p.id === plantillaId);
                    if (plantilla) {
                        plantillasAlerta[canal] = plantilla;
                    }
                }
            });

            const nuevasAlertasProgramadas = [...alertasProgramadas];

            // Alerta programada única
            if (flujoAlerta.programacion.programada.activa) {
                const proximaEjecucion = new Date(flujoAlerta.programacion.programada.fechaHora).toISOString();
                const alertaProgramada = {
                    id: Date.now(),
                    usuario: usuario.nombre,
                    usuario_id: usuario.id,
                    fecha_creacion: new Date().toISOString(),
                    estado: 'activa',
                    contactos: contactosEnvio,
                    tipo_alerta: flujoAlerta.tipoAlerta,
                    canales: flujoAlerta.canales,
                    plantillas: plantillasAlerta,
                    variables: flujoAlerta.variables,
                    programacion: { tipo: 'programada', ...flujoAlerta.programacion.programada },
                    proximaEjecucion: proximaEjecucion,
                    ejecuciones: 0
                };
                nuevasAlertasProgramadas.push(alertaProgramada);
                registrarActividad(
                    `Programó alerta ${flujoAlerta.tipoAlerta} para ${new Date(proximaEjecucion).toLocaleString()}`,
                    'alertas', 'programar',
                    { alerta_id: alertaProgramada.id, tipo: flujoAlerta.tipoAlerta, tipo_programacion: 'programada' }
                );
            }

            // Alerta recurrente
            if (flujoAlerta.programacion.recurrente.activa) {
                const proximaEjecucion = new Date(flujoAlerta.programacion.recurrente.fechaInicio).toISOString();
                const alertaRecurrente = {
                    id: Date.now() + 1,
                    usuario: usuario.nombre,
                    usuario_id: usuario.id,
                    fecha_creacion: new Date().toISOString(),
                    estado: 'activa',
                    contactos: contactosEnvio,
                    tipo_alerta: flujoAlerta.tipoAlerta,
                    canales: flujoAlerta.canales,
                    plantillas: plantillasAlerta,
                    variables: flujoAlerta.variables,
                    programacion: { tipo: 'recurrente', ...flujoAlerta.programacion.recurrente },
                    proximaEjecucion: proximaEjecucion,
                    ejecuciones: 0
                };
                nuevasAlertasProgramadas.push(alertaRecurrente);
                registrarActividad(
                    `Programó alerta recurrente ${flujoAlerta.tipoAlerta}`,
                    'alertas', 'programar',
                    { alerta_id: alertaRecurrente.id, tipo: flujoAlerta.tipoAlerta, tipo_programacion: 'recurrente' }
                );
            }

            setAlertasProgramadas(nuevasAlertasProgramadas);
            localStorage.setItem('alertasProgramadas', JSON.stringify(nuevasAlertasProgramadas));

            let mensaje = 'Alertas programadas correctamente.\n';
            if (!flujoAlerta.programacion.inmediata) {
                alert(mensaje);
                onVolver();
                return;
            }
        }

        // Lógica para aprobación requerida
        if (aprobacionRequerida && usuario?.rol === 'operador') {
            const alertaPendiente = {
                id: Date.now(),
                operador: usuario.nombre,
                operador_id: usuario.id,
                fecha_creacion: new Date().toISOString(),
                estado: 'pendiente',
                contactos: contactos.filter(c => flujoAlerta.contactosSeleccionados.includes(c.id)),
                tipo_alerta: flujoAlerta.tipoAlerta,
                canales: flujoAlerta.canales,
                plantillas: {},
                variables: flujoAlerta.variables
            };

            // Preparar plantillas bilingües
            Object.keys(flujoAlerta.canales).forEach(canal => {
                if (flujoAlerta.canales[canal]) {
                    const plantillaId = flujoAlerta.plantillasSeleccionadas[canal];
                    const plantilla = plantillas.find(p => p.id === plantillaId);
                    if (plantilla) {
                        const plantillaBilingue = { ...plantilla };
                        plantillaBilingue.mensaje = `[ESPAÑOL / SPANISH]\n${plantilla.mensaje}\n\n[ENGLISH / INGLÉS]\n${plantilla.mensaje_en || plantilla.mensaje}`;
                        if (canal === 'email' && plantilla.asunto) {
                            plantillaBilingue.asunto = `${plantilla.asunto} / ${plantilla.asunto_en || plantilla.asunto}`;
                        }
                        alertaPendiente.plantillas[canal] = plantillaBilingue;
                    }
                }
            });

            const nuevasAlertasPendientes = [...alertasPendientes, alertaPendiente];
            setAlertasPendientes(nuevasAlertasPendientes);
            localStorage.setItem('alertasPendientes', JSON.stringify(nuevasAlertasPendientes));

            registrarActividad(
                `Creó alerta tipo ${flujoAlerta.tipoAlerta} (Pendiente de aprobación)`,
                'alertas', 'crear_pendiente',
                { tipo_alerta: flujoAlerta.tipoAlerta, contactos: alertaPendiente.contactos.length }
            );

            alert('Alerta creada correctamente. Esperando aprobación del supervisor.');
            onVolver();
            return;
        }

        // Enviar alerta directamente (si no requiere aprobación o no es operador)
        try {
            const contactosEnvio = contactos.filter(c => flujoAlerta.contactosSeleccionados.includes(c.id));
            const plantillasEnvio = {};

            Object.keys(flujoAlerta.canales).forEach(canal => {
                if (flujoAlerta.canales[canal]) {
                    const plantillaId = flujoAlerta.plantillasSeleccionadas[canal];
                    const plantilla = plantillas.find(p => p.id === plantillaId);
                    if (plantilla) {
                        const plantillaBilingue = { ...plantilla };
                        plantillaBilingue.mensaje = `[ESPAÑOL / SPANISH]\n${plantilla.mensaje}\n\n[ENGLISH / INGLÉS]\n${plantilla.mensaje_en || plantilla.mensaje}`;
                        if (canal === 'email' && plantilla.asunto) {
                            plantillaBilingue.asunto = `${plantilla.asunto} / ${plantilla.asunto_en || plantilla.asunto}`;
                        }
                        plantillasEnvio[canal] = plantillaBilingue;
                    }
                }
            });

            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;
            const response = await fetch('/api/enviar/alerta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contactos_ids: flujoAlerta.contactosSeleccionados, // Send IDs
                    contactos: contactosEnvio, // Keep for now in case logic needs full objects too, but backend primarily needs IDs
                    tipo_alerta: flujoAlerta.tipoAlerta,
                    canales: flujoAlerta.canales,
                    plantillas_ids: flujoAlerta.plantillasSeleccionadas, // Send Template IDs
                    variables: flujoAlerta.variables
                })
            });

            const resultado = await response.json();

            if (resultado.success) {
                registrarActividad(
                    `Envió alerta tipo ${flujoAlerta.tipoAlerta} a ${contactosEnvio.length} contactos`,
                    'alertas', 'enviar',
                    { tipo_alerta: flujoAlerta.tipoAlerta, exitosos: resultado.resultados.resumen.exitosos, fallidos: resultado.resultados.resumen.fallidos }
                );

                alert(`Envío completado:\n${resultado.resultados.resumen.exitosos} exitosos\n${resultado.resultados.resumen.fallidos} fallidos`);
                onVolver();
            } else {
                alert('Error al enviar alertas: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error('Error al enviar alertas:', error);
            alert('Error al enviar alertas: ' + error.message);
            registrarActividad(`Error al enviar alerta: ${error.message}`, 'alertas', 'error', { error: error.message });
        }
    };

    // Renderizar Pasos
    if (flujoAlerta.paso === 1) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={onVolver} className="text-gray-600 hover:text-gray-800">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Alerta</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 1 de 7: Selecciona el tipo de alerta</h3>
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Alerta *</label>
                        <select
                            value={flujoAlerta.tipoAlerta || ''}
                            onChange={(e) => setFlujoAlerta({ ...flujoAlerta, tipoAlerta: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                            <option value="">-- Selecciona un tipo de alerta --</option>
                            {tiposAlerta.map((tipo) => (
                                <option key={tipo.codigo} value={tipo.codigo}>{tipo.codigo} - {tipo.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                if (!flujoAlerta.tipoAlerta) return alert('Selecciona un tipo de alerta');
                                setFlujoAlerta({ ...flujoAlerta, paso: 2 });
                            }}
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (flujoAlerta.paso === 2) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 1 })} className="text-gray-600 hover:text-gray-800">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Alerta {flujoAlerta.tipoAlerta}</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 2 de 7: Selecciona los canales de envío</h3>
                    <div className="space-y-3">
                        {[
                            { id: 'email', icon: Mail, label: 'Email', desc: 'Enviar por correo electrónico' },
                            { id: 'sms', icon: Phone, label: 'SMS', desc: 'Enviar por mensaje de texto' },
                            { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp', desc: 'Enviar por WhatsApp' }
                        ].map(canal => (
                            <label key={canal.id} className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={flujoAlerta.canales[canal.id]}
                                    onChange={() => toggleCanal(canal.id)}
                                    className="w-5 h-5 text-primary-600"
                                />
                                <canal.icon size={24} className="text-primary-600" />
                                <div className="flex-1">
                                    <div className="font-semibold">{canal.label}</div>
                                    <div className="text-sm text-gray-600">{canal.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                if (!Object.values(flujoAlerta.canales).some(v => v)) return alert('Selecciona al menos un canal');
                                setFlujoAlerta({ ...flujoAlerta, paso: 3 });
                            }}
                            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                            Continuar <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 3: Plantillas
    if (flujoAlerta.paso === 3) {
        const canalesActivos = Object.keys(flujoAlerta.canales).filter(c => flujoAlerta.canales[c]);
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 2 })} className="text-gray-600 hover:text-gray-800">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Alerta {flujoAlerta.tipoAlerta}</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 3 de 7: Selecciona las plantillas</h3>
                    {canalesActivos.map(canal => {
                        const plantillasCanal = plantillas.filter(p => p.tipo === canal && p.tipo_alerta_codigo === flujoAlerta.tipoAlerta && p.activa);
                        return (
                            <div key={canal} className="mb-6">
                                <h4 className="font-semibold text-gray-700 mb-3 capitalize">Plantilla para {canal}</h4>
                                {plantillasCanal.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No hay plantillas activas</p>
                                ) : (
                                    <div className="space-y-2">
                                        {plantillasCanal.map(plantilla => (
                                            <label key={plantilla.id} className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${flujoAlerta.plantillasSeleccionadas[canal] === plantilla.id ? 'border-primary-600 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}>
                                                <input
                                                    type="radio"
                                                    name={`plantilla-${canal}`}
                                                    checked={flujoAlerta.plantillasSeleccionadas[canal] === plantilla.id}
                                                    onChange={() => setFlujoAlerta({
                                                        ...flujoAlerta,
                                                        plantillasSeleccionadas: { ...flujoAlerta.plantillasSeleccionadas, [canal]: plantilla.id }
                                                    })}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800">{plantilla.nombre}</div>
                                                    {plantilla.asunto && <div className="text-sm text-gray-600 mt-1"><strong>Asunto:</strong> {plantilla.asunto}</div>}
                                                    <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded border">
                                                        <pre className="whitespace-pre-wrap font-mono text-xs">{plantilla.mensaje.substring(0, 150)}...</pre>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 2 })} className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">Atrás</button>
                        <button
                            onClick={() => {
                                if (!canalesActivos.every(c => flujoAlerta.plantillasSeleccionadas[c])) return alert('Selecciona una plantilla para cada canal');
                                setFlujoAlerta({ ...flujoAlerta, paso: 4 });
                            }}
                            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                            Continuar <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 4: Variables
    if (flujoAlerta.paso === 4) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 3 })} className="text-gray-600 hover:text-gray-800">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Alerta {flujoAlerta.tipoAlerta}</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 4 de 7: Rellena las variables</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora</label>
                            <input
                                type="text"
                                value={flujoAlerta.variables.fecha_hora || ''}
                                onChange={(e) => setFlujoAlerta({ ...flujoAlerta, variables: { ...flujoAlerta.variables, fecha_hora: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ej: 19/11/2024 - 14:30"
                            />
                        </div>
                        {flujoAlerta.tipoAlerta === 'M20' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fenómeno Meteorológico</label>
                                <input
                                    type="text"
                                    value={flujoAlerta.variables.fenomeno || ''}
                                    onChange={(e) => setFlujoAlerta({ ...flujoAlerta, variables: { ...flujoAlerta.variables, fenomeno: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Ej: Lluvia intensa"
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 3 })} className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">Atrás</button>
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 5 })} className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2">Continuar <ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 5: Contactos
    if (flujoAlerta.paso === 5) {
        const contactosActivos = contactos.filter(c => c.activo);

        const toggleSelection = (ids, select) => {
            const current = new Set(flujoAlerta.contactosSeleccionados);
            ids.forEach(id => select ? current.add(id) : current.delete(id));
            setFlujoAlerta({ ...flujoAlerta, contactosSeleccionados: Array.from(current) });
        };

        const selectBy = (field, value) => {
            const ids = contactosActivos.filter(c => c[field] === value).map(c => c.id);
            const allSelected = ids.every(id => flujoAlerta.contactosSeleccionados.includes(id));
            toggleSelection(ids, !allSelected);
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 4 })} className="text-gray-600 hover:text-gray-800"><ChevronLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Alerta {flujoAlerta.tipoAlerta}</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 5 de 7: Selecciona los destinatarios</h3>

                    <div className="mb-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{flujoAlerta.contactosSeleccionados.length} seleccionados</span>
                            <button
                                onClick={() => setFlujoAlerta({ ...flujoAlerta, contactosSeleccionados: flujoAlerta.contactosSeleccionados.length === contactosActivos.length ? [] : contactosActivos.map(c => c.id) })}
                                className="text-primary-600 text-sm font-semibold"
                            >
                                {flujoAlerta.contactosSeleccionados.length === contactosActivos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                            </button>
                        </div>

                        {/* Filtros rápidos simplificados */}
                        <div className="flex flex-wrap gap-2">
                            {['Residente', 'Empresa', 'Institución'].map(type => (
                                <button key={type} onClick={() => selectBy('tipo_usuario', type)} className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200">
                                    {type}s
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto border rounded p-2">
                        {contactosActivos.map(contacto => (
                            <label key={contacto.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${flujoAlerta.contactosSeleccionados.includes(contacto.id) ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'}`}>
                                <input
                                    type="checkbox"
                                    checked={flujoAlerta.contactosSeleccionados.includes(contacto.id)}
                                    onChange={() => toggleSelection([contacto.id], !flujoAlerta.contactosSeleccionados.includes(contacto.id))}
                                />
                                <div>
                                    <div className="font-semibold">{contacto.nombre}</div>
                                    <div className="text-xs text-gray-500">{contacto.tipo_usuario} - {contacto.tipo_punto_critico}</div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 4 })} className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">Atrás</button>
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 6 })} className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2">Continuar <ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 6: Programación
    if (flujoAlerta.paso === 6) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 5 })} className="text-gray-600 hover:text-gray-800"><ChevronLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Alerta {flujoAlerta.tipoAlerta}</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 6 de 7: Programación de envío</h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={flujoAlerta.programacion.inmediata}
                                onChange={(e) => setFlujoAlerta({ ...flujoAlerta, programacion: { ...flujoAlerta.programacion, inmediata: e.target.checked } })}
                                className="w-5 h-5"
                            />
                            <div>
                                <div className="font-semibold">Envío inmediato</div>
                                <div className="text-sm text-gray-600">Enviar ahora mismo</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={flujoAlerta.programacion.programada.activa}
                                onChange={(e) => setFlujoAlerta({ ...flujoAlerta, programacion: { ...flujoAlerta.programacion, programada: { ...flujoAlerta.programacion.programada, activa: e.target.checked } } })}
                                className="w-5 h-5"
                            />
                            <div>
                                <div className="font-semibold">Programar envío</div>
                                <div className="text-sm text-gray-600">Enviar en una fecha específica</div>
                            </div>
                        </label>
                        {flujoAlerta.programacion.programada.activa && (
                            <div className="ml-8 p-4 bg-gray-50 rounded border">
                                <label className="block text-sm font-medium mb-1">Fecha y hora:</label>
                                <input
                                    type="datetime-local"
                                    value={flujoAlerta.programacion.programada.fechaHora}
                                    onChange={(e) => setFlujoAlerta({ ...flujoAlerta, programacion: { ...flujoAlerta.programacion, programada: { ...flujoAlerta.programacion.programada, fechaHora: e.target.value } } })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 5 })} className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">Atrás</button>
                        <button onClick={generarPreview} className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold flex items-center justify-center gap-2">Continuar a Vista Previa</button>
                    </div>
                </div>
            </div>
        );
    }

    // Paso 7: Preview
    if (flujoAlerta.paso === 7) {
        const canalesActivos = Object.keys(flujoAlerta.canales).filter(c => flujoAlerta.canales[c]);
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 6 })} className="text-gray-600 hover:text-gray-800"><ChevronLeft size={24} /></button>
                    <h2 className="text-2xl font-bold text-gray-800">Crear Alerta {flujoAlerta.tipoAlerta}</h2>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 7 de 7: Confirmación</h3>

                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Resumen:</h4>
                        <p><strong>Tipo:</strong> {flujoAlerta.tipoAlerta}</p>
                        <p><strong>Canales:</strong> {canalesActivos.join(', ')}</p>
                        <p><strong>Destinatarios:</strong> {flujoAlerta.contactosSeleccionados.length}</p>
                    </div>

                    <div className="space-y-4">
                        {canalesActivos.map(canal => (
                            <div key={canal} className="border p-4 rounded">
                                <h5 className="font-semibold capitalize mb-2">{canal} Preview:</h5>
                                <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm">{flujoAlerta.preview[canal]?.mensaje}</pre>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button onClick={() => setFlujoAlerta({ ...flujoAlerta, paso: 6 })} className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold">Atrás</button>
                        <button onClick={enviarAlertas} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2">
                            <CheckCircle size={20} />
                            Confirmar y Enviar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default CreateAlert;
