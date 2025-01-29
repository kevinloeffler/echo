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
 * Users routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = function (fastify, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = fastify.pg;
        // Get all users (with optional role filter)
        // @ts-ignore
        fastify.get('/users', { onRequest: [fastify.userHasAnyRole([types_1.UserRole.TEACHER, types_1.UserRole.ADMIN])] }, (req, reply) => __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const { role, archived } = req.query;
            if (role) {
                const roles = role.split(',');
                console.log('request roles:', roles);
                const users = yield database_service_1.DB.users.all.byRole(roles, db);
                return reply.code(200).send(users);
            }
            const users = yield database_service_1.DB.users.all.get(db);
            return reply.send(users);
        }));
        // Get a user by ID
        fastify.get('/users/:id', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { rows } = yield db.query('SELECT * FROM "Users" WHERE id = $1', [id]);
            if (rows.length === 0) {
                return reply.code(404).send({ error: 'User not found' });
            }
            return reply.send(rows[0]);
        }));
        // Create a new user
        fastify.post('/users', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { name, mail, password, role, profile_picture, organisation, link, description } = req.body;
            if (!name || !mail || !password || !role) {
                return reply.code(400).send({ error: 'Missing required fields' });
            }
            const query = `
      INSERT INTO "Users" (name, mail, password, role, profile_picture, organisation, link, description, archived)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `;
            const values = [name, mail, password, role, profile_picture, organisation, link, description, false];
            const { rows } = yield db.query(query, values);
            return reply.code(201).send(rows[0]);
        }));
        // Update a user by ID
        fastify.patch('/users/:id', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const updates = req.body;
            // Construct the update query dynamically
            const fields = Object.keys(updates);
            if (fields.length === 0) {
                return reply.code(400).send({ error: 'No fields to update' });
            }
            const setQuery = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
            const query = `UPDATE "Users" SET ${setQuery} WHERE id = $${fields.length + 1} RETURNING *`;
            const values = [...Object.values(updates), id];
            const { rows } = yield db.query(query, values);
            if (rows.length === 0) {
                return reply.code(404).send({ error: 'User not found' });
            }
            return reply.send(rows[0]);
        }));
        // Soft delete a user by ID
        fastify.delete('/users/:id', (req, reply) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const query = `UPDATE "Users" SET archived = TRUE WHERE id = $1 RETURNING *`;
            const { rows } = yield db.query(query, [id]);
            if (rows.length === 0) {
                return reply.code(404).send({ error: 'User not found' });
            }
            return reply.send(rows[0]);
        }));
    });
};
