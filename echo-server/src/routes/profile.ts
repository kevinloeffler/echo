/**
 * Course routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'

module.exports = async function (fastify: FastifyInstance, opts: any) {
    const db = fastify.pg

    //@ts-ignore
    fastify.get('/profile', { onRequest: [fastify.authenticate] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const user = req.user as User
            console.log('USER:', user)
            return reply.send(user)
        })
}
