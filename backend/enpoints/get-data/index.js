// ./routes/protected-routes.js
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

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
        const { comment } = req.body

        if (!comment) {
            return reply.code(400).send({ error: 'Comment is required' })
        }

        try {
            await transporter.sendMail({
                from: `"My App" <${process.env.SMTP_USER}>`,
                to: process.env.MAIL_TO,
                subject: 'Новый комментарий BauTex',
                text: comment
            })

            return reply.code(200).send({ success: true, message: 'Email sent successfully' })
        } catch (err) {
            console.error('Email error:', err)
            return reply.code(500).send({ success: false, message: 'Failed to send email' })
        }
    })
}
