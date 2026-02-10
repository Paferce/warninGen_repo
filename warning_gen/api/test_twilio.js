// test_twilio.js - Script para probar la configuracion de Twilio
require('dotenv').config();
const twilio = require('twilio');

console.log('\n========================================');
console.log('VERIFICACION DE CONFIGURACION TWILIO');
console.log('========================================\n');

// Verificar variables de entorno
console.log('Variables de entorno:');
console.log('-------------------------');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log(`Account SID: ${accountSid ? 'Configurado (' + accountSid.substring(0, 8) + '...)' : 'NO configurado'}`);
console.log(`Auth Token: ${authToken ? 'Configurado (' + authToken.substring(0, 8) + '...)' : 'NO configurado'}`);
console.log(`Telefono SMS: ${phoneNumber ? phoneNumber : 'NO configurado'}`);
console.log(`Telefono WhatsApp: ${whatsappNumber ? whatsappNumber : 'Usando numero SMS'}`);

if (!accountSid || !authToken) {
    console.log('\nERROR: Faltan credenciales de Twilio en el archivo .env\n');
    console.log('Por favor configura:');
    console.log('  TWILIO_ACCOUNT_SID=tu_account_sid');
    console.log('  TWILIO_AUTH_TOKEN=tu_auth_token');
    console.log('  TWILIO_PHONE_NUMBER=+12345678901\n');
    process.exit(1);
}

if (!phoneNumber) {
    console.log('\nERROR: Falta TWILIO_PHONE_NUMBER en el archivo .env\n');
    process.exit(1);
}

console.log('\nInicializando cliente Twilio...');

try {
    const client = twilio(accountSid, authToken);
    console.log('Cliente inicializado correctamente\n');
    
    // Verificar cuenta
    console.log('Verificando cuenta...');
    
    client.api.accounts(accountSid).fetch()
        .then(account => {
            console.log('Cuenta verificada:');
            console.log(`   Nombre: ${account.friendlyName}`);
            console.log(`   Estado: ${account.status}`);
            console.log(`   Tipo: ${account.type}\n`);
            
            // Verificar numeros
            console.log('Verificando numeros de telefono...');
            
            return client.incomingPhoneNumbers.list({ phoneNumber: phoneNumber });
        })
        .then(phoneNumbers => {
            if (phoneNumbers.length > 0) {
                console.log('Numero de telefono encontrado:');
                phoneNumbers.forEach(number => {
                    console.log(`   Numero: ${number.phoneNumber}`);
                    console.log(`   Nombre: ${number.friendlyName}`);
                    console.log(`   Capacidades:`);
                    console.log(`     - SMS: ${number.capabilities.sms ? 'SI' : 'NO'}`);
                    console.log(`     - MMS: ${number.capabilities.mms ? 'SI' : 'NO'}`);
                    console.log(`     - Voz: ${number.capabilities.voice ? 'SI' : 'NO'}`);
                });
            } else {
                console.log('ADVERTENCIA: Numero no encontrado en tu cuenta Twilio');
                console.log('   Verifica que el numero sea correcto');
            }
            
            console.log('\nEstado de WhatsApp:');
            if (whatsappNumber) {
                if (whatsappNumber.includes('14155238886')) {
                    console.log('   Usando WhatsApp Sandbox (desarrollo)');
                    console.log('   NOTA: Los usuarios deben unirse al sandbox primero');
                } else {
                    console.log('   Numero de WhatsApp configurado: ' + whatsappNumber);
                    console.log('   INFO: Verifica que este aprobado por Meta/WhatsApp');
                }
            } else {
                console.log('   Usando mismo numero que SMS');
            }
            
            console.log('\n========================================');
            console.log('CONFIGURACION COMPLETA Y VALIDA');
            console.log('========================================\n');
            console.log('Proximos pasos:');
            console.log('1. Inicia el servidor: node server.js');
            console.log('2. Prueba enviando una alerta desde la aplicacion');
            console.log('3. Verifica los logs en Twilio Console\n');
        })
        .catch(error => {
            console.error('\nERROR al verificar la cuenta:');
            console.error('   ' + error.message);
            
            if (error.code === 20003) {
                console.error('\n   Credenciales incorrectas');
                console.error('   Verifica tu Account SID y Auth Token');
            } else if (error.code === 21211) {
                console.error('\n   Numero de telefono invalido');
                console.error('   Verifica el formato: +[codigo pais][numero]');
            }
            
            console.error('\n   Codigos de error comunes:');
            console.error('   20003: Credenciales incorrectas');
            console.error('   20404: Recurso no encontrado');
            console.error('   21211: Numero de telefono invalido');
            console.error('   21608: Numero no verificado (cuenta trial)\n');
        });
        
} catch (error) {
    console.error('\nERROR al inicializar cliente:');
    console.error('   ' + error.message + '\n');
    process.exit(1);
}