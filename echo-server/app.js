'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const cors = require('@fastify/cors')
const fastifyStatic = require('@fastify/static')

// Pass --options via CLI arguments in command to enable these options.
const options = {}

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  fastify.addHook('onRequest', (request, reply, done) => {
    reply.header("Cross-Origin-Opener-Policy", "same-origin")
    reply.header("Cross-Origin-Embedder-Policy", "require-corp")
    done()
  })

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/static/', // Optional: specifies the URL prefix for accessing static files
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, '/dist/plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, '/dist/routes'),
    options: Object.assign({}, opts)
  })
}

module.exports.options = options
