import fp from "fastify-plugin"
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import fastifyJwt from '@fastify/jwt'
import {UserRole} from '../types'

module.exports = fp(async function(fastify: FastifyInstance, opts: any) {
    // @ts-ignore
    fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET,
        cookie: {
            cookieName: 'Token', // Name of your cookie
            // signed: false // TODO: set to true in production SSL
        }
    })

    fastify.decorate("authenticate", async function(request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify()
        } catch (err: any) {
            reply.send(err)
        }
    })

    fastify.decorate("isAdmin", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            // Verify and decode the JWT
            const decoded = await request.jwtVerify()

            // @ts-ignore
            if (decoded.role !== UserRole.ADMIN) {
                return reply.status(301).send({ message: "Insufficient privileges" })
            }
        } catch (err: any) {
            return reply.status(301).send({ message: "Invalid token" })
        }
    })

    fastify.decorate("isTeacher", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            // Verify and decode the JWT
            const decoded = await request.jwtVerify()

            // @ts-ignore
            if (decoded.role !== UserRole.TEACHER) {
                return reply.status(301).send({ message: "Insufficient privileges" })
            }
        } catch (err: any) {
            return reply.status(301).send({ message: "Invalid token" })
        }
    })

    fastify.decorate('userHasAnyRole', function (anyRole: UserRole[]) {
        return async function (request: FastifyRequest, reply: FastifyReply) {
            try {
                const user = await request.jwtVerify() as Optional<User>
                if (!anyRole.includes(user?.role)) {
                    return reply.status(403).send({ error: `Forbidden: access required` })
                }
            } catch (err) {
                return reply.status(401).send({ error: 'Unauthorized: Invalid token' })
            }
        }
    })

})
