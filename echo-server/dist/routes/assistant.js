"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const client = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
/**
 * Auth routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = function (fastify, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.post('/test', (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('\n------- RECEIVED TEST REQUEST -------\n');
            res.send({ 'hello': 'world' });
        }));
        fastify.post('/assistant', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            console.log('\n------- RECEIVED ASSISTANT REQUEST -------\n');
            // try {
            const { messages, model, max_tokens } = request.body;
            console.log('message:', messages);
            console.log('model:', model);
            console.log('max_tokens:', max_tokens);
            const stream = yield client.messages.create({
                messages,
                model,
                max_tokens,
                stream: true,
            });
            // Set appropriate headers for streaming
            reply.raw.setHeader('Content-Type', 'application/json; charset=utf-8');
            reply.raw.setHeader('Transfer-Encoding', 'chunked');
            reply.raw.setHeader('Access-Control-Allow-Origin', '*');
            try {
                // Process and forward each event in the stream
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const messageStreamEvent = _c;
                    // Convert the event to a JSON string
                    const eventData = JSON.stringify(messageStreamEvent);
                    // Write the event data to the response stream
                    reply.raw.write(eventData);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // End the response stream
            reply.raw.end();
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
        }));
    });
};
