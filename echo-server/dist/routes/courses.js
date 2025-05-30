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
/**
 * Course routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = function (fastify, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = fastify.pg;
        // @ts-ignore
        fastify.get('/courses', { onRequest: [fastify.authenticate] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (user.role === types_1.UserRole.ADMIN) {
                const courses = yield database_service_1.DB.courses.all.get(db);
                return reply.send(courses);
            }
            if (user.role === types_1.UserRole.TEACHER) {
                const courses = yield database_service_1.DB.courses.all.byTeacher(user.id, db);
                console.log('DB courses', courses);
                return reply.send(courses);
            }
            if (user.role === types_1.UserRole.STUDENT) {
                const courses = yield database_service_1.DB.courses.all.byStudent(user.id, db);
                return reply.send(courses);
            }
            return reply.code(200).send([]);
        }));
        // @ts-ignore
        fastify.get('/courses/:id', { onRequest: [fastify.authenticate] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            console.log('running :id');
            const user = req.user;
            const { id } = req.params;
            console.log('server id:', id);
            const course = yield database_service_1.DB.courses.one.byId(id, user, db);
            return reply.send(course);
        }));
        // @ts-ignore
        fastify.post('/courses', { onRequest: [fastify.userHasAnyRole([types_1.UserRole.TEACHER, types_1.UserRole.ADMIN])] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const body = yield JSON.parse(req.body);
            const { name } = body;
            if (!name)
                return reply.code(400).send({ error: "Missing required field: 'name'" });
            const result = yield database_service_1.DB.courses.new(name, '', user.id, false, false, db);
            console.log('insert course result:', result);
            return reply.code(200).send({ status: true, message: 'Course created' });
        }));
        // @ts-ignore
        fastify.patch('/courses/:id', { onRequest: [fastify.authenticate] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            // const user = req.user as User
            const body = yield JSON.parse(req.body);
            const { id, name, description, hidden } = body;
            if (!id)
                return reply.code(400).send({ error: "Missing required field: 'id'" });
            const result = yield database_service_1.DB.courses.update(id, name, description, hidden, db);
            return reply.code(200).send({ status: true, message: 'Course updated', result });
        }));
        /* Course Users */
        // @ts-ignore
        fastify.get('/courses/:id/users', { onRequest: [fastify.userHasAnyRole([types_1.UserRole.TEACHER, types_1.UserRole.ADMIN])] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user; // TODO: check if user has access to the course
            const { id } = req.params;
            const users = yield database_service_1.DB.users.all.byCourse(id, db);
            return reply.code(200).send(users);
        }));
        // @ts-ignore
        fastify.patch('/courses/:id/users', { onRequest: [fastify.userHasAnyRole([types_1.UserRole.TEACHER, types_1.UserRole.ADMIN])] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user; // TODO: check if user has access to the course
            const { id } = req.params;
            const body = yield JSON.parse(req.body);
            if ((body === null || body === void 0 ? void 0 : body.method) === 'add') {
                yield database_service_1.DB.users.addToCourse(id, body.student, db);
            }
            else if ((body === null || body === void 0 ? void 0 : body.method) === 'remove') {
                yield database_service_1.DB.users.removeFromCourse(id, body.student, db);
            }
            console.log('updated user');
            return reply.code(200).send({ status: true });
        }));
    });
};
