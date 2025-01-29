import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import {UserRole} from '../types'
import {DB} from '../lib/database_service'


/**
 * Users routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = async function (fastify: FastifyInstance, opts: any) {
    const db = fastify.pg

    // Get all users (with optional role filter)
    // @ts-ignore
    fastify.get('/users', { onRequest: [fastify.userHasAnyRole([UserRole.TEACHER, UserRole.ADMIN])] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            // @ts-ignore
            const { role, archived } = req.query

            if (role) {
                const roles = role.split(',')
                console.log('request roles:', roles)
                const users = await DB.users.all.byRole(roles, db)
                return reply.code(200).send(users)
            }

            const users = await DB.users.all.get(db)
            return reply.send(users)
    })

    // Get a user by ID
    fastify.get('/users/:id', async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: string }
        const { rows } = await db.query('SELECT * FROM "Users" WHERE id = $1', [id])

        if (rows.length === 0) {
            return reply.code(404).send({ error: 'User not found' })
        }

        return reply.send(rows[0])
    })

    // Create a new user
    fastify.post('/users', async (req: FastifyRequest, reply: FastifyReply) => {
        const { name, mail, password, role, profile_picture, organisation, link, description } = req.body as any

        if (!name || !mail || !password || !role) {
            return reply.code(400).send({ error: 'Missing required fields' })
        }

        const query = `
      INSERT INTO "Users" (name, mail, password, role, profile_picture, organisation, link, description, archived)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `
        const values = [name, mail, password, role, profile_picture, organisation, link, description, false]

        const { rows } = await db.query(query, values)
        return reply.code(201).send(rows[0])
    })

    // Update a user by ID
    fastify.patch('/users/:id', async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: string }
        const updates = req.body as any

        // Construct the update query dynamically
        const fields = Object.keys(updates)
        if (fields.length === 0) {
            return reply.code(400).send({ error: 'No fields to update' })
        }

        const setQuery = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ')
        const query = `UPDATE "Users" SET ${setQuery} WHERE id = $${fields.length + 1} RETURNING *`
        const values = [...Object.values(updates), id]

        const { rows } = await db.query(query, values)
        if (rows.length === 0) {
            return reply.code(404).send({ error: 'User not found' })
        }

        return reply.send(rows[0])
    })

    // Soft delete a user by ID
    fastify.delete('/users/:id', async (req: FastifyRequest, reply: FastifyReply) => {
        const { id } = req.params as { id: string }
        const query = `UPDATE "Users" SET archived = TRUE WHERE id = $1 RETURNING *`
        const { rows } = await db.query(query, [id])

        if (rows.length === 0) {
            return reply.code(404).send({ error: 'User not found' })
        }

        return reply.send(rows[0])
    })
}
