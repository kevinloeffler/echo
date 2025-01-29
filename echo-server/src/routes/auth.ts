import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import {UserRole} from '../types'
import {DB} from '../lib/database_service'
import {comparePasswords} from '../lib/auth_service'


/**
 * Auth routes
 * @param {FastifyInstance} fastify
 * @param {Object} opts
 */
module.exports = async function (fastify: FastifyInstance, opts: any) {
    const db = fastify.pg

    // Get all users (with optional role filter)
    fastify.post('/login', async (req: FastifyRequest, reply: FastifyReply) => {
        const { email, password } = req.body as { email: Optional<string>, password: Optional<string> }
        if (!email || !password) return reply.code(400).send({ message: 'Email and password are required' })

        const credentials = await DB.passwords.getByMail(email, db)
        if (!credentials) return reply.code(401).send({ message: 'Invalid email or password' })

        const isMatch = comparePasswords(password, credentials.password, credentials.salt)
        if (!isMatch) return reply.code(401).send({ message: 'Invalid email or password' })

        const user = await DB.users.one.byEmail(email, db)
        const token = fastify.jwt.sign(user || {}, { expiresIn: process.env.JWT_VALIDITY })
        console.log('\ntoken', token, '\n')
        reply
            .setCookie('Token', token, {
                httpOnly: true,
                // secure: true, // Ensure this is true in production
                sameSite: 'lax',
                path: '/'
            })
            .send({ login: true, message: 'Login successful' })

        // return reply.code(200).send({ token })
    })

    fastify.post('/register', async (req: FastifyRequest, reply: FastifyReply) => {
        const { name, email, password } = req.body as { name: Optional<string>, email: Optional<string>, password: Optional<string> }
        if (!name || !email || !password) return reply.code(400).send({ message: 'Name, email and password are required' })

        // Create user
        const newUser = await DB.users.new(name, email, UserRole.STUDENT, password, db)
        console.log('newUser:', newUser)

        return reply.code(200).send({ message: `Created new user '${name}'`, user: newUser })
    })

    fastify.get('/logout', async (req: FastifyRequest, reply: FastifyReply) => {
        reply.clearCookie('Token').send({ message: 'Logged out' })
    })

}
