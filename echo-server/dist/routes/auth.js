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
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const database_service_1 = require("../lib/database_service");
const auth_service_1 = require("../lib/auth_service");
/**
 * Auth routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = function (fastify, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = fastify.pg;
        // Get all users (with optional role filter)
        fastify.post('/login', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password)
                return reply.code(400).send({ message: 'Email and password are required' });
            const credentials = yield database_service_1.DB.passwords.getByMail(email, db);
            if (!credentials)
                return reply.code(401).send({ message: 'Invalid email or password' });
            const isMatch = (0, auth_service_1.comparePasswords)(password, credentials.password, credentials.salt);
            if (!isMatch)
                return reply.code(401).send({ message: 'Invalid email or password' });
            const user = yield database_service_1.DB.users.one.byEmail(email, db);
            const token = fastify.jwt.sign(user || {}, { expiresIn: process.env.JWT_VALIDITY });
            console.log('\ntoken', token, '\n');
            reply
                .setCookie('Token', token, {
                httpOnly: true,
                // secure: true, // Ensure this is true in production
                sameSite: 'lax',
                path: '/'
            })
                .send({ login: true, message: 'Login successful' });
            // return reply.code(200).send({ token })
        }));
        fastify.post('/register', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = req.body;
            if (!name || !email || !password)
                return reply.code(400).send({ message: 'Name, email and password are required' });
            // Create user
            const newUser = yield database_service_1.DB.users.new(name, email, types_1.UserRole.STUDENT, password, db);
            console.log('newUser:', newUser);
            return reply.code(200).send({ message: `Created new user '${name}'`, user: newUser });
        }));
        fastify.get('/logout', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            reply.clearCookie('Token').send({ message: 'Logged out' });
        }));
    });
};
