'use strict'

import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import {hashPassword} from '../lib/auth_service'

module.exports = async function (fastify: FastifyInstance, opts: any) {
  fastify.get('/', async function (request: FastifyRequest, reply: FastifyReply) {
    const pw = hashPassword('password')
    return { root: true, testCredentials: pw }
  })
}
