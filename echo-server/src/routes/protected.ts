import {FastifyInstance, FastifyRequest} from 'fastify'


module.exports = async function(fastify: FastifyInstance, opts: any) {
    // @ts-ignore
    fastify.get("/protected", { onRequest: [fastify.authenticate] }, async function(request: FastifyRequest, reply: FastifyInstance) {
        console.log('authenticated user:', request.user)
        return request.user
    })
}
