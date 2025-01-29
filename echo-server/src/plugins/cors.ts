
import fp from 'fastify-plugin'
import cors from '@fastify/cors'
import { FastifyInstance } from 'fastify'

// Create a reusable Fastify plugin for CORS
module.exports = fp(async function(fastify: FastifyInstance, opts: any) {
    fastify.register(cors, {
        origin: ['http://localhost:5173', 'http://localhost'], // TODO: add frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
        credentials: true // Enable cookies and credentials if needed
    })
})
