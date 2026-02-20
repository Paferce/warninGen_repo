require('dotenv').config();
const whatsappService = require('./services/whatsapp_service');

async function test() {
    console.log('Content SID:', process.env.WHATSAPP_CONTENT_SID);
    
    const resultado = await whatsappService.enviarWhatsApp(
        '+34609173611'  // <- CAMBIA POR TU NUMERO
    );
    
    console.log('Resultado:', resultado);
}

test();
