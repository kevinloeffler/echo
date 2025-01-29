import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })


/**
 * Auth routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = async function (fastify: FastifyInstance, opts: any) {

    fastify.post('/test', async (req: FastifyRequest, res: FastifyReply) => {
        console.log('\n------- RECEIVED TEST REQUEST -------\n')
        res.send({'hello': 'world'})
    })

    fastify.post('/assistant', async (request: FastifyRequest, reply: FastifyReply) => {
        console.log('\n------- RECEIVED ASSISTANT REQUEST -------\n')
        // try {
            const { messages, model, max_tokens } = request.body
            console.log('message:', messages)
            console.log('model:', model)
            console.log('max_tokens:', max_tokens)

            const stream = await client.messages.create({
                messages,
                model,
                max_tokens,
                stream: true,
            })

            // Set appropriate headers for streaming
            reply.raw.setHeader('Content-Type', 'application/json; charset=utf-8')
            reply.raw.setHeader('Transfer-Encoding', 'chunked')
            reply.raw.setHeader('Access-Control-Allow-Origin', '*')

            // Process and forward each event in the stream
            for await (const messageStreamEvent of stream) {
                // Convert the event to a JSON string
                const eventData = JSON.stringify(messageStreamEvent)

                // Write the event data to the response stream
                reply.raw.write(eventData)
            }

            // End the response stream
            reply.raw.end()

        /*

            // Set the appropriate content type for Server-Sent Events (SSE)
            reply.raw.setHeader('Content-Type', 'text/event-stream')
            reply.raw.setHeader('Cache-Control', 'no-cache')
            reply.raw.setHeader('Connection', 'keep-alive')
            reply.raw.setHeader('Access-Control-Allow-Origin', '*')

            // Iterate over the asynchronous iterator
            for await (const event of stream) {
                reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
            }

            reply.raw.end()


            /*
            reply.headers({
                'Content-Type': 'application/json',
                'Transfer-Encoding': 'chunked',
                // 'Access-Control-Allow-Origin': 'http://localhost:5173'
            })

            let response = []

            for await (const messageStreamEvent of stream) {
                response.push(messageStreamEvent)
                // reply.raw.write(JSON.stringify(messageStreamEvent))
            }
            // reply.raw.end()

            reply.send({'answer': response})

            */
        // } catch (error) {
        //     reply.status(500).send({ error: 'An error occurred while processing the request.' })
        // }
    })



}
