'use strict'

// const fp = require('fastify-plugin')
import fp from 'fastify-plugin'
import {FastifyInstance} from 'fastify'

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
module.exports = fp(async function (fastify: FastifyInstance, opts: any) {
  fastify.register(require('@fastify/sensible'), {
    errorHandler: false
  })
})
