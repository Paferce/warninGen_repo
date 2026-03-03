// routes/enviar.routes.js - Rutas para envío de alertas
const express = require('express');
const router = express.Router();
// El pool de la base de datos se toma de global.pool definido en server.js
const pool = global.pool;
const { enviarEmail, enviarEmailMasivo } = require('../email_service');
const { enviarSMS, enviarSMSMasivo } = require('../sms_service');
const { enviarWhatsApp, enviarWhatsAppMasivo } = require('../whatsapp_service');

/**
 * POST /api/enviar/alerta
 * Enviar alerta a contactos seleccionados
 */
router.post('/alerta', async (req, res) => {
    try {
        const {
            plantillas_ids, // { email: 1, sms: 2 }
            contactos_ids,  // [1, 2, 3]
            canales,        // { email: true, sms: false, whatsapp: true }
            variables,
            programado,
            fecha_programada
        } = req.body;

        // Validaciones
        if (!contactos_ids || contactos_ids.length === 0) {
            return res.status(400).json({ error: 'Debe seleccionar al menos un contacto' });
        }

        if (!canales || (!canales.email && !canales.sms && !canales.whatsapp)) {
            return res.status(400).json({ error: 'Debe seleccionar al menos un canal' });
        }

        // Obtener contactos
        const [contactos] = await pool.query(
            'SELECT * FROM contactos WHERE id IN (?) AND activo = TRUE',
            [contactos_ids]
        );

        if (contactos.length === 0) {
            return res.status(404).json({ error: 'No se encontraron contactos activos para los IDs proporcionados' });
        }

        // Responder Inmediatamente (HTTP 202 Accepted) para evitar Timeout en Nginx
        res.status(202).json({
            success: true,
            mensaje: 'Proceso de envío iniciado en segundo plano',
            resultados: {
                resumen: {
                    exitosos: 'Procesando...',
                    fallidos: 'Procesando...'
                },
                detalles: {}
            }
        });

        // -------------------------------------------------------------
        // Función asíncrona de procesamiento en segundo plano
        // -------------------------------------------------------------
        const procesarEnvioEnSegundoPlano = async () => {
            const resultados = {
                email: null,
                sms: null,
                whatsapp: null
            };

            try {
                // Procesar cada canal activo
                for (const canal of Object.keys(canales)) {
                    if (canales[canal]) {
                        const plantillaId = plantillas_ids[canal];
                        if (!plantillaId) continue;

                        // Obtener plantilla para este canal
                        const [plantillas] = await pool.query(
                            'SELECT * FROM plantillas WHERE id = ? AND activa = TRUE',
                            [plantillaId]
                        );

                        if (plantillas.length === 0) {
                            console.warn(`Plantilla ${plantillaId} para ${canal} no encontrada o inactiva`);
                            continue;
                        }
                        const plantilla = plantillas[0];

                        // Filtrar destinatarios suscritos a este canal
                        const campoContacto = canal === 'sms' ? 'telefono' : (canal === 'whatsapp' ? 'whatsapp' : 'email');
                        const campoSuscripcion = `suscrito_${canal}`;

                        const destinatarios = contactos
                            .filter(c => c[campoContacto] && c[campoSuscripcion])
                            .map(c => ({
                                destinatario: c[campoContacto],
                                variables: { ...variables, nombre: c.nombre }
                            }));

                        if (destinatarios.length > 0) {
                            const resultadosCanal = {
                                exitosos: 0,
                                fallidos: 0,
                                detalles: []
                            };

                            // Enviar
                            for (const dest of destinatarios) {
                                let resultado;
                                if (canal === 'email') {
                                    resultado = await enviarEmail(dest.destinatario, plantilla.asunto || 'Alerta', plantilla.mensaje, dest.variables);
                                } else if (canal === 'sms') {
                                    resultado = await enviarSMS(dest.destinatario, plantilla.mensaje, dest.variables);
                                    await new Promise(r => setTimeout(r, 200)); // Rate limiting Twilio SMS
                                } else if (canal === 'whatsapp') {
                                    resultado = await enviarWhatsApp(dest.destinatario, plantilla.mensaje, dest.variables);
                                    await new Promise(r => setTimeout(r, 200)); // Rate limiting Twilio WhatsApp
                                }

                                if (resultado && resultado.success) {
                                    resultadosCanal.exitosos++;
                                } else {
                                    resultadosCanal.fallidos++;
                                }
                                resultadosCanal.detalles.push(resultado);
                            }

                            resultados[canal] = resultadosCanal;

                            // Guardar log en BD
                            await pool.query(
                                `INSERT INTO alertas (plantilla_id, estado, canal, total_destinatarios, destinatarios_exitosos, destinatarios_fallidos, fecha_enviada)
                                 VALUES (?, 'enviada', ?, ?, ?, ?, NOW())`,
                                [plantillaId, canal, destinatarios.length, resultadosCanal.exitosos, resultadosCanal.fallidos]
                            );

                            console.log(`OK BACKGROUND: ${canal}: ${resultadosCanal.exitosos} exitosos`);
                        }
                    }
                }
                console.log('FINALIZADO: Envío en segundo plano completado.');
            } catch (errorBg) {
                console.error('ERROR BACKGROUND: Falla durante el envío masivo en segundo plano', errorBg);
            }
        };

        // Iniciar proceso sin bloquear el thread de Express
        procesarEnvioEnSegundoPlano();

    } catch (error) {
        console.error('Error al enviar alerta:', error);
        res.status(500).json({ error: 'Error interno al enviar alerta', detalles: error.message });
    }
});

module.exports = router;