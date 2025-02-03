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
                SELECT
                    c.id AS id,
                    c.name,
                    c.hidden,
                    c.archived,
                    COALESCE(json_agg(DISTINCT jsonb_build_object(
                            'id', ch.id,
                            'name', ch.name,
                            'type', 'chapter',
                            'parent_id', ch.parent_id
                                               )) FILTER (WHERE ch.id IS NOT NULL), '[]') AS children,
                    COALESCE(json_agg(DISTINCT jsonb_build_object(
                            'id', u.id,
                            'name', u.name,
                            'mail', u.mail
                                               )) FILTER (WHERE ct.teacher_id IS NOT NULL), '[]') AS creator,
                    COALESCE(json_agg(DISTINCT jsonb_build_object(
                            'id', su.id,
                            'name', su.name,
                            'mail', su.mail
                                               )) FILTER (WHERE cs.student_id IS NOT NULL), '[]') AS students
                FROM
                    "Courses" c
                        LEFT JOIN "Chapters" ch ON ch.course_id = c.id
                        LEFT JOIN "Lessons" l ON l.chapter_id = ch.id
                        LEFT JOIN "CourseTeachers" ct ON ct.course_id = c.id
                        LEFT JOIN "Users" u ON u.id = ct.teacher_id
                        LEFT JOIN "CourseStudents" cs ON cs.course_id = c.id
                        LEFT JOIN "Users" su ON su.id = cs.student_id
                GROUP BY c.id;
                `
                const { rows } = await db.query(query, [])
                console.log('rows', rows)
                return rows
            },

            async byTeacher(teacherId: string, db: Postgres): Promise<Optional<Course[]>> {
                const query = `
                    SELECT 
                        c.id AS id,
                        c.name AS name,
                        c.hidden AS hidden,
                        c.archived AS archived,
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'id', ch.id,
                                    'name', ch.name,
                                    'type', 'chapter',
                                    'parent_id', ch.parent_id
                                )
                            ) FILTER (WHERE ch.id IS NOT NULL), '[]'
                        ) AS children,
                        jsonb_build_object(
                            'id', u.id,
                            'name', u.name,
                            'mail', u.mail
                        ) AS creator,
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'id', su.id,
                                    'name', su.name,
                                    'mail', su.mail
                                )
                            ) FILTER (WHERE su.id IS NOT NULL), '[]'
                        ) AS students
                    FROM 
                        "Courses" c
                    -- Join with CourseTeachers to get the creator (teacher)
                    INNER JOIN "CourseTeachers" ct ON c.id = ct.course_id
                    INNER JOIN "Users" u ON u.id = ct.teacher_id
                    -- Join with Chapters to get the children
                    LEFT JOIN "Chapters" ch ON ch.course_id = c.id
                    -- Join with CourseStudents to get the students
                    LEFT JOIN "CourseStudents" cs ON cs.course_id = c.id
                    LEFT JOIN "Users" su ON su.id = cs.student_id
                    WHERE 
                        ct.teacher_id = $1
                    GROUP BY 
                        c.id, u.id;
                `
                const params = [teacherId]
                const { rows } = await db.query(query, params)
                return rows
            },

            async byStudent(studentId: string, db: Postgres): Promise<Optional<Course[]>> {
                const query = `
                    SELECT 
                        c.id AS id,
                        c.name AS name,
                        c.hidden AS hidden,
                        c.archived AS archived,
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'id', ch.id,
                                    'name', ch.name,
                                    'type', 'chapter',
                                    'parent_id', ch.parent_id
                                )
                            ) FILTER (WHERE ch.id IS NOT NULL), '[]'
                        ) AS children,
                        jsonb_build_object(
                            'id', u.id,
                            'name', u.name,
                            'mail', u.mail
                        ) AS creator,
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'id', su.id,
                                    'name', su.name,
                                    'mail', su.mail
                                )
                            ) FILTER (WHERE su.id IS NOT NULL), '[]'
                        ) AS students
                    FROM 
                        "Courses" c
                    -- Join with CourseStudents to filter by the enrolled student
                    INNER JOIN "CourseStudents" cs ON c.id = cs.course_id
                    INNER JOIN "Users" enrolled ON enrolled.id = cs.student_id
                    -- Join with CourseTeachers to get the creator (teacher)
                    INNER JOIN "CourseTeachers" ct ON c.id = ct.course_id
                    INNER JOIN "Users" u ON u.id = ct.teacher_id
                    -- Join with Chapters to get the children
                    LEFT JOIN "Chapters" ch ON ch.course_id = c.id
                    -- Join with CourseStudents to get all students of the course
                    LEFT JOIN "CourseStudents" cs_all ON cs_all.course_id = c.id
                    LEFT JOIN "Users" su ON su.id = cs_all.student_id
                    WHERE 
                        enrolled.id = $1
                    GROUP BY 
                        c.id, u.id;
                `
                const params = [studentId]
                const { rows } = await db.query(query, params)
                return rows
            }
        },

        one: {

            async byId(id: number, user: User, db: Postgres): Promise<Optional<Course>> {
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

                const query = `SELECT * FROM "Courses" WHERE id = $1`
                const params = [id]
                const { rows } = await db.query(query, params)
                return rows[0]
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

    chapters: {
        get: {
            async byId() {},
            async byName() {},
            async all() {},
        },

        async new(course_id: string, parent_id: string, name: string, db: Postgres): Promise<Optional<Chapter>> {
            const query = `INSERT INTO "Chapters" (course_id, parent_id, name) VALUES ($1, $2, $3) RETURNING *;`
            const params = [course_id, parent_id, name]
            const { rows } = await db.query(query, params)
            return rows[0]
        },
    },

    lessons: {
        get: {
            async byId() {},
            async byCourse() {},
            async byTeacher() {},
            async all() {},
        },

        async new(chapter_id: string, name: string, description: string, db: Postgres): Promise<Optional<Lesson>> {
            const query = `INSERT INTO "Lessons" (chapter_id, name, description) VALUES ($1, $2, $3) RETURNING *;`
            const params = [chapter_id, name, description]
            const { rows } = await db.query(query, params)
            return rows[0]
        },
    },

}


/***** ERRORS *****/

class RecordNotFound extends Error {
    constructor(message: Optional<string >) {
        super()
        this.message = message || 'Record not found'
    }
}
