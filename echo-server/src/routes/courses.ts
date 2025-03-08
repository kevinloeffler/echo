import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import {UserRole} from '../types'
import {DB} from '../lib/database_service'

/**
 * Course routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = async function (fastify: FastifyInstance, opts: any) {
    const db = fastify.pg

    // @ts-ignore
    fastify.get('/courses', { onRequest: [fastify.authenticate] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const user = req.user as User

            if (user.role === UserRole.ADMIN) {
                const courses = await DB.courses.all.get(db)
                return reply.send(courses)
            }

            if (user.role === UserRole.TEACHER) {
                const courses = await DB.courses.all.byTeacher(user.id, db)
                console.log('DB courses', courses)
                return reply.send(courses)
            }

            if (user.role === UserRole.STUDENT) {
                const courses = await DB.courses.all.byStudent(user.id, db)
                return reply.send(courses)
            }

            return reply.code(200).send([])
    })

    // @ts-ignore
    fastify.get('/courses/:id', { onRequest: [fastify.authenticate] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            console.log('running :id')
            const user = req.user as User
            const { id } = req.params

            console.log('server id:', id)

            const course = await DB.courses.one.byId(id, user, db)
            return reply.send(course)
        })


    // @ts-ignore
    fastify.post('/courses', { onRequest: [fastify.userHasAnyRole([UserRole.TEACHER, UserRole.ADMIN])] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const user = req.user as User
            const body = await JSON.parse(req.body as string)
            const { name } = body
            if (!name) return reply.code(400).send({ error: "Missing required fields: 'name'" })
            const result = await DB.courses.new(name, '', user.id, false, false, db)
            console.log('insert course result:', result)
            return reply.code(200).send({ status: true, message: 'Course created' })
        })

    // @ts-ignore
    fastify.patch('/courses/:id', { onRequest: [fastify.authenticate] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const user = req.user as User
            // TODO
        })

}
