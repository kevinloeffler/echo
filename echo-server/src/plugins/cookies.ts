import fp from 'fastify-plugin'
import cookie from '@fastify/cookie'
import {FastifyInstance} from 'fastify'

module.exports = fp(async function(fastify: FastifyInstance, opts: any) {
    fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET,
    })
})
