import fp from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import {FastifyInstance} from 'fastify'


module.exports = fp(async function (fastify: FastifyInstance, opts: any) {
    fastify.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL,
    })
})
