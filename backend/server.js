import Fastify from 'fastify';
import {fastifyMysql} from "@fastify/mysql";
import {createUsers} from "./sql.js";
import authRoutes from "./enpoints/auth-routes.js";
import fastifyMultipart from '@fastify/multipart';
import fastifyCors from '@fastify/cors';
import protectedRoutes from "./enpoints/get-data/index.js";

const {
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE
} = process.env


const fastify = new Fastify();
fastify.register(fastifyMultipart);
fastify.register(fastifyMysql, {
    connectionString: `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`,
})
fastify.register(fastifyCors, { origin: true, credentials: true });

fastify.register(authRoutes);
fastify.register(protectedRoutes);

fastify.addHook('onRequest', (req, reply, done) => {
    console.log(req.method, req.url);
    done();
});

fastify.addHook('onReady', async () => {
    try {
        fastify.mysql.getConnection(onConnect)
        function onConnect(err, client) {

            client.query(
                createUsers,
                function onResult(err, result) {
                    client.release()
                    fastify.log.info('Таблица users готова');
                }
            )
        }
    } catch (e) {

        fastify.log.error('Ошибка при создании таблицы users:', err);
        process.exit(1);
    }
});
fastify.get('/user/:id', (req, reply) => {
    fastify.mysql.getConnection((err, client) => {
        if (err) return reply.send(err)

        client.query(
            'SELECT * FROM users WHERE id=?', [req.params.id],
            function onResult(err, result) {
                client.release()
                reply.send(err || result)
            }
        )
    });
})




fastify.listen({ port: 3000, host: '0.0.0.0' }, err => {
    if (err) throw err
    console.log(`Server listening on ${fastify.server.address().port}`)
})
