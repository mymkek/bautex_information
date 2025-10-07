// ./routes/protected-routes.js
import axios from 'axios';
import https from 'https';

export default async function protectedRoutes(fastify, options) {
    fastify.get('/get-data', async (req, reply) => {
        const url = 'https://mail.bautex.pro:37443/WMS/hs/Products/Update/';
        const auth = Buffer.from('БейВВ:654321').toString('base64');

        // === DEV ONLY: игнорировать просроченный/самоподписанный сертификат ===
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        try {
            const res = await axios.get(url, {
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: 'application/json',
                },
                httpsAgent,
                timeout: 15000, // таймаут на всякий случай
            });

            // Если API возвращает JSON — res.data будет объектом
            return reply.code(res.status).send({
                status: res.status,
                response: res.data,
            });
        } catch (err) {
            // Сервер ответил с ошибкой (например 4xx/5xx)
            if (err.response) {
                return reply.code(err.response.status).send({
                    error: `Ошибка от API: ${err.response.statusText || err.response.status}`,
                    details: err.response.data,
                });
            }

            // Ошибка при установлении соединения, таймаут и т.д.
            fastify.log.error(err);
            return reply.code(500).send({
                error: err.message || 'Unknown error',
            });
        }
    });

    fastify.post('/comment', async (req, reply) => {
        return reply.code(200).send({
            fdsf: 'fdsfdsf'
        })
    })
}
