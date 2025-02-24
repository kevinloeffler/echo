import {PostgresDb} from '@fastify/postgres'
import {hashPassword} from './auth_service'

type Postgres = PostgresDb & Record<string, PostgresDb>

export const DB = {

    users: {

        one: {
            async byId(id: string, db: Postgres): Promise<Optional<User>> {
                const query = 'SELECT * FROM "Users" WHERE id = $1'
                const params = [id]
                const { rows } = await db.query(query, params)
                if (!rows[0]) return undefined
                return rows[0]
            },

            async byEmail(email: string, db: Postgres): Promise<Optional<User>> {
                const query = 'SELECT * FROM "Users" WHERE mail = $1'
                const params = [email]
                const { rows } = await db.query(query, params)
                if (!rows[0]) return undefined
                return rows[0]
            },
        },

        all: {
            async get(db: Postgres): Promise<Optional<User[]>> {
                const query = 'SELECT * FROM "Users"'
                const { rows } = await db.query(query, [])
                return rows
            },

            async byRole(roles: string[], db: Postgres): Promise<Optional<User[]>> {
                const query = `SELECT * FROM "Users" WHERE role = ANY($1);`
                const { rows } = await db.query(query, [roles])
                return rows
            },
        },

        async new(name: string, email: string, role: string, password: string, db: Postgres): Promise<Optional<User>> {
            // Insert into Users table
            const query = `INSERT INTO "Users" (name, mail, role) VALUES ($1, $2, $3) RETURNING *`;
            const params = [name, email, role]
            const { rows } = await db.query(query, params)
            const newUser: User = rows[0]
            if (!newUser) return undefined

            // Insert into UserPasswords table
            const credentials = hashPassword(password)
            const pw_result = await DB.passwords.new(newUser.id, credentials.password, credentials.salt, db)
            if (!pw_result) return undefined  // TODO: undo insert user operation when password could not be created...
            return newUser
        }
    },

    passwords: {

        async getByMail(email: string, db: Postgres): Promise<Optional<{ password: string , salt: string }>> {
            const query = `SELECT up.password, up.salt FROM "Users" u
            JOIN "UserPasswords" up ON u.id = up.user_id
            WHERE u.mail = $1;`
            const params = [email]
            const { rows } = await db.query(query, params)
            if (!rows[0]) return undefined
            return rows[0]
        },

        async new(userId: string, hashed_password: string, salt: string, db: Postgres) {
            const query = `INSERT INTO "UserPasswords" (user_id, password, salt) VALUES ($1, $2, $3) RETURNING *`;
            const params = [userId, hashed_password, salt]
            const { rows } = await db.query(query, params)
            if (!rows[0]) return undefined
            return rows[0]
        }
    },

    courses: {
        all: {
            async get(db: Postgres): Promise<Optional<Course[]>> {
                // TODO: rewrite this query to make it simpler, I don't think we need the json stuff
                const query = `
                    WITH RECURSIVE content_tree AS (
                        -- Base case: Get all top-level chapters (parent_id IS NULL)
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                        WHERE cc.parent_id IS NULL

                        UNION ALL

                        -- Recursive case: Get content of previous level
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                                 INNER JOIN content_tree ct ON cc.parent_id = ct.id
                    )
                    SELECT
                        c.id AS course_id,
                        c.name AS course_name,
                        c.description AS course_description,
                        c.hidden AS course_hidden,
                        c.archived AS course_archived,
                        ct.*
                    FROM content_tree ct
                             JOIN "Courses" c ON ct.course_id = c.id
                    ORDER BY c.id, ct.parent_id NULLS FIRST, ct.next_id;
                `
                const { rows } = await db.query(query, [])

                return buildCourseHierarchy(rows)
            },

            async byTeacher(teacherId: string, db: Postgres): Promise<Optional<Course[]>> {
                const query = `
                    WITH RECURSIVE content_tree AS (
                        -- Base case: Get all top-level chapters (parent_id IS NULL) for teacher's courses
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                        WHERE cc.parent_id IS NULL
                          AND cc.course_id IN (SELECT course_id FROM "CourseTeachers" WHERE teacher_id = $1)

                        UNION ALL

                        -- Recursive case: Get content of previous level
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                                 INNER JOIN content_tree ct ON cc.parent_id = ct.id
                    )
                    SELECT
                        c.id AS course_id,
                        c.name AS course_name,
                        c.description AS course_description,
                        c.hidden AS course_hidden,
                        c.archived AS course_archived,
                        ct.*
                    FROM content_tree ct
                             JOIN "Courses" c ON ct.course_id = c.id
                    WHERE c.id IN (SELECT course_id FROM "CourseTeachers" WHERE teacher_id = $1)
                    ORDER BY c.id, ct.parent_id NULLS FIRST, ct.next_id;
                `
                const params = [teacherId]
                const { rows } = await db.query(query, params)
                return buildCourseHierarchy(rows)
            },

            async byStudent(studentId: string, db: Postgres): Promise<Optional<Course[]>> {
                const query = `
                    WITH RECURSIVE content_tree AS (
                        -- Base case: Get all top-level chapters (parent_id IS NULL) for student's courses
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                        WHERE cc.parent_id IS NULL
                          AND cc.course_id IN (SELECT course_id FROM "CourseStudents" WHERE student_id = $1)

                        UNION ALL

                        -- Recursive case: Get content of previous level
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                                 INNER JOIN content_tree ct ON cc.parent_id = ct.id
                    )
                    SELECT
                        c.id AS course_id,
                        c.name AS course_name,
                        c.description AS course_description,
                        c.hidden AS course_hidden,
                        c.archived AS course_archived,
                        ct.*
                    FROM content_tree ct
                             JOIN "Courses" c ON ct.course_id = c.id
                    WHERE c.id IN (SELECT course_id FROM "CourseStudents" WHERE student_id = $1)
                    ORDER BY c.id, ct.parent_id NULLS FIRST, ct.next_id;
                `
                const params = [studentId]
                const { rows } = await db.query(query, params)
                return buildCourseHierarchy(rows)
            }
        },

        one: {

            async byId(id: number, user: User, db: Postgres): Promise<Optional<Course>> {
                // Check if the user is allowed to access the course
                const preQuery = `
                    SELECT EXISTS (
                        SELECT 1
                        FROM "CourseTeachers"
                        WHERE course_id = $1 AND teacher_id = $2
                    ) AS is_allowed;
                `
                const preParams = [id, user.id]
                const check = await db.query(preQuery, preParams)
                if (!check.rows) return

                // Get course
                // const query = `SELECT * FROM "Courses" WHERE id = $1`
                // const params = [id]
                // const { rows } = await db.query(query, params)
                // return rows[0]

                const query = `
                    WITH RECURSIVE content_tree AS (
                        -- Base case: Get all top-level chapters (parent_id IS NULL)
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                        WHERE cc.course_id = $1 AND cc.parent_id IS NULL

                        UNION ALL

                        -- Recursive case: Get content of previous level
                        SELECT
                            cc.id,
                            cc.course_id,
                            cc.parent_id,
                            cc.next_id,
                            cc.type,
                            cc.name,
                            cc.description
                        FROM "CourseContent" cc
                                 INNER JOIN content_tree ct ON cc.parent_id = ct.id
                    )
                    SELECT
                        c.id AS course_id,
                        c.name AS course_name,
                        c.description AS course_description,
                        c.hidden AS course_hidden,
                        c.archived AS course_archived,
                        ct.*
                    FROM content_tree ct
                             JOIN "Courses" c ON ct.course_id = c.id
                    ORDER BY ct.parent_id NULLS FIRST, ct.next_id;
                `

                const values = [id]
                const result = await db.query(query, values)
                const content = result.rows

                return buildHierarchy(content)
            },

            async byTitle(title: string, db: Postgres): Promise<Optional<Course[]>> {
                const query = `SELECT * FROM "Courses" WHERE name = $1`
                const params = [title]
                const { rows } = await db.query(query, params)
                return rows
            },

        },

        async new(name: string, description: string, userId: string, hidden=false, archived=false, db: Postgres): Promise<Optional<any>> {
            const query = `
                    WITH inserted_course AS (
                        INSERT INTO "Courses" (name, description, hidden, archived)
                            VALUES ($1, $2, $3, $4)
                            RETURNING id
                    )
                    INSERT INTO "CourseTeachers" (course_id, teacher_id)
                    SELECT id, $5 FROM inserted_course;
                `
            const values = [name, description, hidden, archived, userId]
            const { rows } = await db.query(query, values)
            return rows
        },

        async update(name: string, description: string, userId: string, hidden=false, archived=false, db: Postgres): Promise<Optional<any>> {
            const query = ``
        }
    },

}


/***** HELPER FUNCTIONS *****/

function buildCourseHierarchy(items: any): Course[] {
    const coursesMap = new Map()

    // Initialize courses
    items.forEach((item: any) => {
        if (!coursesMap.has(item.course_id)) {
            coursesMap.set(item.course_id, {
                id: item.course_id,
                name: item.course_name,
                description: item.course_description,
                hidden: item.course_hidden,
                archived: item.course_archived,
                content: []
            })
        }
    })

    // Build nested content for each course
    const contentMap = new Map()

    items.forEach((item: any) => {
        contentMap.set(item.id, {
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            content: []
        })
    })

    // Construct hierarchical structure
    items.forEach((item: any) => {
        if (item.parent_id) {
            contentMap.get(item.parent_id).content.push(contentMap.get(item.id))
        } else {
            coursesMap.get(item.course_id).content.push(contentMap.get(item.id))
        }
    });

    return Array.from(coursesMap.values())
}

function buildHierarchy(items: any): Optional<Course> {
    const map = new Map()
    const root: any[] = []

    // Extract course attributes (only once, since all rows contain the same course info)
    const course = items.length > 0 ? {
        id: items[0].course_id,
        name: items[0].course_name,
        description: items[0].course_description,
        hidden: items[0].course_hidden,
        archived: items[0].course_archived
    } : null

    // Initialize map
    items.forEach((item: any) => {
        map.set(item.id, {
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            content: []
        })
    })

    // Construct tree
    items.forEach((item: any) => {
        if (item.parent_id) {
            map.get(item.parent_id).content.push(map.get(item.id));
        } else {
            root.push(map.get(item.id)) // Top-level chapters
        }
    })

    const result = course ? { ...course, content: root } : undefined
    console.log('COURSE RESULT:', result)

    return result
}


/***** ERRORS *****/

class RecordNotFound extends Error {
    constructor(message: Optional<string >) {
        super()
        this.message = message || 'Record not found'
    }
}
