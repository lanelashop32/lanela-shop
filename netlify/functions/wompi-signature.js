// Función serverless de Netlify — genera la firma de integridad de Wompi
// SIN exponer el secreto en el navegador del cliente.
//
// CÓMO ACTIVARLA:
// 1. Regístrate en https://comercios.wompi.co y obtén tus llaves (sandbox y producción).
// 2. En el dashboard de Netlify de este sitio, ve a Site settings > Environment variables
//    y agrega una variable llamada WOMPI_INTEGRITY_SECRET con el valor de tu
//    "Secreto de integridad" (Desarrolladores > Secretos para integración técnica en Wompi).
// 3. Verifica que la llave pública en checkout.html (public-key) sea la misma cuenta
//    (usa la de sandbox "pub_test_..." para pruebas, y la de producción "pub_prod_..." cuando ya cobres real).
// 4. Netlify detecta automáticamente esta carpeta (netlify/functions) y publica
//    este endpoint en /.netlify/functions/wompi-signature — no necesitas configurar nada más.

const crypto = require('crypto');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) {
    return {
      statusCode: 501,
      body: JSON.stringify({ error: 'WOMPI_INTEGRITY_SECRET no configurado en Netlify todavía.' })
    };
  }

  try {
    const { reference, amountInCents, currency } = JSON.parse(event.body);
    if (!reference || !amountInCents || !currency) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Faltan datos: reference, amountInCents, currency' }) };
    }

    const chain = `${reference}${amountInCents}${currency}${secret}`;
    const signature = crypto.createHash('sha256').update(chain).digest('hex');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature })
    };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Solicitud inválida' }) };
  }
};
