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
                `;
                    const { rows } = yield db.query(query, []);
                    return buildCourseHierarchy(rows);
                });
            },
            byTeacher(teacherId, db) {
                return __awaiter(this, void 0, void 0, function* () {
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
                `;
                    const params = [teacherId];
                    const { rows } = yield db.query(query, params);
                    return buildCourseHierarchy(rows);
                });
            },
            byStudent(studentId, db) {
                return __awaiter(this, void 0, void 0, function* () {
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
                `;
                    const params = [studentId];
                    const { rows } = yield db.query(query, params);
                    return buildCourseHierarchy(rows);
                });
            }
        },
        one: {
            byId(id, user, db) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Check if the user is allowed to access the course
                    const preQuery = `
                    SELECT EXISTS (
                        SELECT 1
                        FROM "CourseTeachers"
                        WHERE course_id = $1 AND teacher_id = $2
                    ) AS is_allowed;
                `;
                    const preParams = [id, user.id];
                    const check = yield db.query(preQuery, preParams);
                    if (!check.rows)
                        return;
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
                `;
                    const values = [id];
                    const result = yield db.query(query, values);
                    const content = result.rows;
                    return buildHierarchy(content);
                });
            },
            byTitle(title, db) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = `SELECT * FROM "Courses" WHERE name = $1`;
                    const params = [title];
                    const { rows } = yield db.query(query, params);
                    return rows;
                });
            },
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
};
/***** HELPER FUNCTIONS *****/
function buildCourseHierarchy(items) {
    const coursesMap = new Map();
    // Initialize courses
    items.forEach((item) => {
        if (!coursesMap.has(item.course_id)) {
            coursesMap.set(item.course_id, {
                id: item.course_id,
                name: item.course_name,
                description: item.course_description,
                hidden: item.course_hidden,
                archived: item.course_archived,
                content: []
            });
        }
    });
    // Build nested content for each course
    const contentMap = new Map();
    items.forEach((item) => {
        contentMap.set(item.id, {
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            content: []
        });
    });
    // Construct hierarchical structure
    items.forEach((item) => {
        if (item.parent_id) {
            contentMap.get(item.parent_id).content.push(contentMap.get(item.id));
        }
        else {
            coursesMap.get(item.course_id).content.push(contentMap.get(item.id));
        }
    });
    return Array.from(coursesMap.values());
}
function buildHierarchy(items) {
    const map = new Map();
    const root = [];
    // Extract course attributes (only once, since all rows contain the same course info)
    const course = items.length > 0 ? {
        id: items[0].course_id,
        name: items[0].course_name,
        description: items[0].course_description,
        hidden: items[0].course_hidden,
        archived: items[0].course_archived
    } : null;
    // Initialize map
    items.forEach((item) => {
        map.set(item.id, {
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            content: []
        });
    });
    // Construct tree
    items.forEach((item) => {
        if (item.parent_id) {
            map.get(item.parent_id).content.push(map.get(item.id));
        }
        else {
            root.push(map.get(item.id)); // Top-level chapters
        }
    });
    const result = course ? Object.assign(Object.assign({}, course), { content: root }) : undefined;
    console.log('COURSE RESULT:', result);
    return result;
}
/***** ERRORS *****/
class RecordNotFound extends Error {
    constructor(message) {
        super();
        this.message = message || 'Record not found';
    }
}
