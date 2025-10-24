import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export default async function authRoutes(fastify, options) {
    fastify.post('/api/auth/register', (req, reply) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return reply.status(400).send({ error: 'Username и password обязательны' });
        }

        // Хэшируем пароль
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return reply.status(500).send({ error: err.message });

            // Берём соединение из пула
            fastify.mysql.getConnection((err, client) => {
                if (err) return reply.status(500).send({ error: err.message });

                client.query(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    [username, hashedPassword], // здесь два значения
                    (err, result) => {
                        client.release(); // обязательно освобождаем соединение

                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                return reply.status(400).send({ error: 'Пользователь существует' });
                            }
                            return reply.status(500).send({ error: err.message });
                        }

                        reply.send({ message: 'Регистрация успешна', user: { id: result.insertId, username } });
                    }
                );
            });
        });
    });



    fastify.post('/api/auth/login', (req, reply) => {
        const { username, password, rememberMe } = req.body;

        if (!username || !password) {
            return reply.status(400).send({ error: 'Username и password обязательны' });
        }

        // Берём соединение из пула
        fastify.mysql.getConnection((err, client) => {
            if (err) return reply.status(500).send({ error: err.message });

            // Ищем пользователя по username
            client.query(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (err, results) => {
                    client.release();

                    if (err) return reply.status(500).send({ error: err.message });
                    if (results.length === 0) return reply.status(401).send({ error: 'Пользователь не найден' });

                    const user = results[0];


                    // Сравниваем пароль
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) return reply.status(500).send({ error: err.message });
                        if (!isMatch) return reply.status(401).send({ error: 'Неверный пароль' });

                        // Генерируем короткий access token
                        const accessToken = jwt.sign(
                            { id: user.id, username: user.username },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );

                        if (rememberMe) {
                            // Генерируем refresh token
                            const refreshToken = crypto.randomBytes(64).toString('hex'); // можно хранить как строку
                            const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

                            // Сохраняем refresh token в базе
                            fastify.mysql.getConnection((err, conn2) => {
                                if (err) return reply.status(500).send({ error: err.message });

                                conn2.query(
                                    'UPDATE users SET refresh_token = ?, refresh_token_expiry = ? WHERE id = ?',
                                    [refreshToken, expiryDate, user.id],
                                    (err) => {
                                        conn2.release();
                                        if (err) return reply.status(500).send({ error: err.message });

                                        reply.send({
                                            message: 'Вход выполнен',
                                            accessToken,
                                            refreshToken,
                                        });
                                    }
                                );
                            });
                        } else {
                            // Только короткий JWT
                            reply.send({ message: 'Вход выполнен', accessToken });
                        }
                    });
                }
            );
        });
    });

    fastify.post('/api/auth/logout', async (req, res) => {
        try {

            return res.send({ message: 'Выход выполнен' });
        } catch (err) {
            console.log(err)
            fastify.log.error(err);
            return res.status(500).send({ error: 'Ошибка при выходе' });
        }
    });



    fastify.get('/api/auth/me', (req, reply) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return reply.status(401).send({ error: 'Токен отсутствует' });

        // Формат: "Bearer <token>"
        const token = authHeader.split(' ')[1];
        if (!token) return reply.status(401).send({ error: 'Токен отсутствует' });

        // Проверка JWT
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return reply.status(401).send({ error: 'Неверный токен' });

            const userId = decoded.id;

            // Берём соединение из пула
            fastify.mysql.getConnection((err, client) => {
                if (err) return reply.status(500).send({ error: err.message });

                // Получаем пользователя по id
                client.query(
                    'SELECT id, username, last_login FROM users WHERE id = ?',
                    [userId],
                    (err, results) => {
                        client.release();

                        if (err) return reply.status(500).send({ error: err.message });
                        if (results.length === 0) return reply.status(404).send({ error: 'Пользователь не найден' });

                        const user = results[0];
                        reply.send({ user });
                    }
                );
            });
        });
    });

    fastify.post('/api/auth/refresh', async (req, res) => {
        // TODO: проверка refresh-token, выдача нового access-token
        res.send({token: null});
    });

}
