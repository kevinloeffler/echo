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

    // @ts-ignore  TODO: check if user has access
    fastify.get('/course-content/:id', {}, async (req: FastifyRequest, reply: FastifyReply) => {
        // @ts-ignore
        const { id } = req.params
        console.log(`\n\n\n course content id: ${id} \n\n\n`)
        const courseContent = await DB.CourseContent.get(id, db)
        return reply.code(200).send({ ...courseContent })
    })

    // @ts-ignore
    fastify.post('/course-content/new', { onRequest: [fastify.userHasAnyRole([UserRole.TEACHER, UserRole.ADMIN])] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const body = await JSON.parse(req.body as string)
            const { courseId, parentId, index, type, name } = body
            if (!_check(courseId) || !name) return reply.code(400).send({ error: 'Missing required fields' })

            const res = await DB.CourseContent.new(courseId, parentId, index, type, name, db)
            console.log('res:', res)
            return reply.code(200).send({status: true, inserted: res})
        })

    // @ts-ignore
    fastify.patch('/course-content/move', { onRequest: [fastify.userHasAnyRole([UserRole.TEACHER, UserRole.ADMIN])] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const user = req.user as User
            const body = await JSON.parse(req.body as string)
            const { contentId, newParentId, index } = body
            if (!_check(contentId) || !_check(newParentId) || !_check(index)) return reply.code(400).send({ error: 'Missing required fields'})

            await DB.CourseContent.moveCourseContent(contentId, newParentId, index, user, db)
            return reply.code(200).send({status: true})
        })

    // @ts-ignore
    fastify.patch('/course-content/:id', { onreset: [fastify.userHasAnyRole([UserRole.TEACHER, UserRole.ADMIN])] },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const user = req.user as User
            const body = await JSON.parse(req.body as string)
            const { id, name, type, description } = body
            if (!id || !name || !type || !description) return reply.code(400).send({ error: 'Missing required fields' })
            await DB.CourseContent.update(id, name, type, description, db)
            return reply.code(200).send({ status: true })
        })

}


function _check(arg: any): boolean {
    return !isNaN(parseInt(arg))
}
