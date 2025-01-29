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
exports.DB = void 0;
const auth_service_1 = require("./auth_service");
exports.DB = {
    users: {
        one: {
            byId(id, db) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = 'SELECT * FROM "Users" WHERE id = $1';
                    const params = [id];
                    const { rows } = yield db.query(query, params);
                    if (!rows[0])
                        return undefined;
                    return rows[0];
                });
            },
            byEmail(email, db) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = 'SELECT * FROM "Users" WHERE mail = $1';
                    const params = [email];
                    const { rows } = yield db.query(query, params);
                    if (!rows[0])
                        return undefined;
                    return rows[0];
                });
            },
        },
        all: {
            get(db) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = 'SELECT * FROM "Users"';
                    const { rows } = yield db.query(query, []);
                    return rows;
                });
            },
            byRole(roles, db) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = `SELECT * FROM "Users" WHERE role = ANY($1);`;
                    const { rows } = yield db.query(query, [roles]);
                    return rows;
                });
            },
        },
        new(name, email, role, password, db) {
            return __awaiter(this, void 0, void 0, function* () {
                // Insert into Users table
                const query = `INSERT INTO "Users" (name, mail, role) VALUES ($1, $2, $3) RETURNING *`;
                const params = [name, email, role];
                const { rows } = yield db.query(query, params);
                const newUser = rows[0];
                if (!newUser)
                    return undefined;
                // Insert into UserPasswords table
                const credentials = (0, auth_service_1.hashPassword)(password);
                const pw_result = yield exports.DB.passwords.new(newUser.id, credentials.password, credentials.salt, db);
                if (!pw_result)
                    return undefined; // TODO: undo insert user operation when password could not be created...
                return newUser;
            });
        }
    },
    passwords: {
        getByMail(email, db) {
            return __awaiter(this, void 0, void 0, function* () {
                const query = `SELECT up.password, up.salt FROM "Users" u
            JOIN "UserPasswords" up ON u.id = up.user_id
            WHERE u.mail = $1;`;
                const params = [email];
                const { rows } = yield db.query(query, params);
                if (!rows[0])
                    return undefined;
                return rows[0];
            });
        },
        new(userId, hashed_password, salt, db) {
            return __awaiter(this, void 0, void 0, function* () {
                const query = `INSERT INTO "UserPasswords" (user_id, password, salt) VALUES ($1, $2, $3) RETURNING *`;
                const params = [userId, hashed_password, salt];
                const { rows } = yield db.query(query, params);
                if (!rows[0])
                    return undefined;
                return rows[0];
            });
        }
    },
    courses: {
        all: {
            get(db) {
                return __awaiter(this, void 0, void 0, function* () {
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
                `;
                    const { rows } = yield db.query(query, []);
                    console.log('rows', rows);
                    return rows;
                });
            },
            byTeacher(teacherId, db) {
                return __awaiter(this, void 0, void 0, function* () {
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
                `;
                    const params = [teacherId];
                    const { rows } = yield db.query(query, params);
                    return rows;
                });
            },
            byStudent(studentId, db) {
                return __awaiter(this, void 0, void 0, function* () {
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
                `;
                    const params = [studentId];
                    const { rows } = yield db.query(query, params);
                    return rows;
                });
            }
        },
        new(name_1, description_1, userId_1) {
            return __awaiter(this, arguments, void 0, function* (name, description, userId, hidden = false, archived = false, db) {
                const query = `
                    WITH inserted_course AS (
                        INSERT INTO "Courses" (name, description, hidden, archived)
                            VALUES ($1, $2, $3, $4)
                            RETURNING id
                    )
                    INSERT INTO "CourseTeachers" (course_id, teacher_id)
                    SELECT id, $5 FROM inserted_course;
                `;
                const values = [name, description, hidden, archived, userId];
                const { rows } = yield db.query(query, values);
                return rows;
            });
        },
        update(name_1, description_1, userId_1) {
            return __awaiter(this, arguments, void 0, function* (name, description, userId, hidden = false, archived = false, db) {
                const query = ``;
            });
        }
    },
    chapters: {
        get: {
            byId() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
            byName() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
            all() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
        },
        new(course_id, parent_id, name, db) {
            return __awaiter(this, void 0, void 0, function* () {
                const query = `INSERT INTO "Chapters" (course_id, parent_id, name) VALUES ($1, $2, $3) RETURNING *;`;
                const params = [course_id, parent_id, name];
                const { rows } = yield db.query(query, params);
                return rows[0];
            });
        },
    },
    lessons: {
        get: {
            byId() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
            byCourse() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
            byTeacher() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
            all() {
                return __awaiter(this, void 0, void 0, function* () { });
            },
        },
        new(chapter_id, name, description, db) {
            return __awaiter(this, void 0, void 0, function* () {
                const query = `INSERT INTO "Lessons" (chapter_id, name, description) VALUES ($1, $2, $3) RETURNING *;`;
                const params = [chapter_id, name, description];
                const { rows } = yield db.query(query, params);
                return rows[0];
            });
        },
    },
};
/***** ERRORS *****/
class RecordNotFound extends Error {
    constructor(message) {
        super();
        this.message = message || 'Record not found';
    }
}
