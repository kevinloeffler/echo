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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const types_1 = require("../types");
module.exports = (0, fastify_plugin_1.default)(function (fastify, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        fastify.register(jwt_1.default, {
            secret: process.env.JWT_SECRET,
            cookie: {
                cookieName: 'Token', // Name of your cookie
                // signed: false // TODO: set to true in production SSL
            }
        });
        fastify.decorate("authenticate", function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('request.cookies:', request.cookies);
                try {
                    yield request.jwtVerify();
                }
                catch (err) {
                    reply.send(err);
                }
            });
        });
        fastify.decorate("isAdmin", function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // Verify and decode the JWT
                    const decoded = yield request.jwtVerify();
                    // @ts-ignore
                    if (decoded.role !== types_1.UserRole.ADMIN) {
                        return reply.status(301).send({ message: "Insufficient privileges" });
                    }
                }
                catch (err) {
                    return reply.status(301).send({ message: "Invalid token" });
                }
            });
        });
        fastify.decorate("isTeacher", function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    // Verify and decode the JWT
                    const decoded = yield request.jwtVerify();
                    // @ts-ignore
                    if (decoded.role !== types_1.UserRole.TEACHER) {
                        return reply.status(301).send({ message: "Insufficient privileges" });
                    }
                }
                catch (err) {
                    return reply.status(301).send({ message: "Invalid token" });
                }
            });
        });
        fastify.decorate('userHasAnyRole', function (anyRole) {
            return function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const user = yield request.jwtVerify();
                        if (!anyRole.includes(user === null || user === void 0 ? void 0 : user.role)) {
                            return reply.status(403).send({ error: `Forbidden: access required` });
                        }
                    }
                    catch (err) {
                        return reply.status(401).send({ error: 'Unauthorized: Invalid token' });
                    }
                });
            };
        });
    });
});
