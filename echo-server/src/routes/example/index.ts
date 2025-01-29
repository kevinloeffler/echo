'use strict'

import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'

module.exports = async function (fastify: FastifyInstance, opts: any) {
  fastify.get('/', async function (request: FastifyRequest, reply: FastifyReply) {
    const client = await fastify.pg.connect()
    try {
      const {rows} = await client.query('SELECT NOW()')
      return rows
    } finally {
      client.release()
    }
  })
}
