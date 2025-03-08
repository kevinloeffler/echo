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
                    -- Get all courses the teacher teaches
                    WITH RECURSIVE teacher_courses AS (
                        SELECT 
                            c.id AS course_id, 
                            c.name AS course_name, 
                            c.description AS course_description,
                            c.hidden AS course_hidden, 
                            c.archived AS course_archived
                        FROM "Courses" c
                        WHERE c.id IN (SELECT course_id FROM "CourseTeachers" WHERE teacher_id = $1)
                    ),
            
                    content_tree AS (
                        -- Base case: Get all top-level content (parent_id IS NULL)
                        SELECT 
                            cc.id, cc.course_id, cc.parent_id, cc.next_id, cc.type, cc.name, cc.description
                        FROM "CourseContent" cc
                        WHERE cc.parent_id IS NULL 
                          AND cc.course_id IN (SELECT course_id FROM teacher_courses)
            
                        UNION ALL
            
                        -- Recursive case: Get children content
                        SELECT 
                            cc.id, cc.course_id, cc.parent_id, cc.next_id, cc.type, cc.name, cc.description
                        FROM "CourseContent" cc
                        INNER JOIN content_tree ct ON cc.parent_id = ct.id
                    )
            
                    -- Join all courses (even those without content) with content_tree
                    SELECT 
                        tc.course_id, tc.course_name, tc.course_description, tc.course_hidden, tc.course_archived,
                        ct.id, ct.parent_id, ct.next_id, ct.type, ct.name AS content_name, ct.description AS content_description
                    FROM teacher_courses tc
                    LEFT JOIN content_tree ct ON tc.course_id = ct.course_id
                    ORDER BY tc.course_id, ct.parent_id NULLS FIRST, ct.next_id;
                `;
                    const params = [teacherId];
                    const { rows } = yield db.query(query, params);
                    return buildCourseHierarchy(rows);
                });
            },
            byStudent(studentId, db) {
                return __awaiter(this, void 0, void 0, function* () {
                    const query = `
                    -- Get all courses the student is enrolled in
                    WITH RECURSIVE student_courses AS (
                        SELECT 
                            c.id AS course_id, 
                            c.name AS course_name, 
                            c.description AS course_description,
                            c.hidden AS course_hidden, 
                            c.archived AS course_archived
                        FROM "Courses" c
                        WHERE c.id IN (SELECT course_id FROM "CourseStudents" WHERE student_id = $1)
                    ),
            
                    content_tree AS (
                        -- Base case: Get all top-level course content (parent_id IS NULL)
                        SELECT 
                            cc.id, cc.course_id, cc.parent_id, cc.next_id, cc.type, cc.name, cc.description, 1 AS depth
                        FROM "CourseContent" cc
                        WHERE cc.parent_id IS NULL 
                          AND cc.course_id IN (SELECT course_id FROM student_courses)
            
                        UNION ALL
            
                        -- Recursive case: Get nested content, preventing infinite loops
                        SELECT 
                            cc.id, cc.course_id, cc.parent_id, cc.next_id, cc.type, cc.name, cc.description, ct.depth + 1
                        FROM "CourseContent" cc
                        INNER JOIN content_tree ct ON cc.parent_id = ct.id
                        WHERE ct.depth < 20  -- Prevents infinite recursion
                    )
            
                    -- Join all student courses (even if they have no content) with content_tree
                    SELECT 
                        sc.course_id, sc.course_name, sc.course_description, sc.course_hidden, sc.course_archived,
                        ct.id, ct.parent_id, ct.next_id, ct.type, ct.name AS content_name, ct.description AS content_description
                    FROM student_courses sc
                    LEFT JOIN content_tree ct ON sc.course_id = ct.course_id
                    ORDER BY sc.course_id, ct.parent_id NULLS FIRST, ct.next_id;
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
                    const query = `
                    -- Ensure we always fetch the course details
                    WITH RECURSIVE course_info AS (
                        SELECT 
                            c.id AS course_id, 
                            c.name AS course_name, 
                            c.description AS course_description,
                            c.hidden AS course_hidden, 
                            c.archived AS course_archived
                        FROM "Courses" c
                        WHERE c.id = $1
                    ),
            
                    content_tree AS (
                        -- Base case: Get all top-level content (parent_id IS NULL)
                        SELECT 
                            cc.id, cc.course_id, cc.parent_id, cc.next_id, cc.type, cc.name, cc.description, 1 AS depth
                        FROM "CourseContent" cc
                        WHERE cc.parent_id IS NULL AND cc.course_id = $1
            
                        UNION ALL
            
                        -- Recursive case: Get nested content, preventing infinite loops
                        SELECT 
                            cc.id, cc.course_id, cc.parent_id, cc.next_id, cc.type, cc.name, cc.description, ct.depth + 1
                        FROM "CourseContent" cc
                        INNER JOIN content_tree ct ON cc.parent_id = ct.id
                        WHERE ct.depth < 20 -- Prevent infinite recursion
                    )
            
                    -- Join the course with its content (even if no content exists)
                    SELECT 
                        ci.course_id, ci.course_name, ci.course_description, ci.course_hidden, ci.course_archived,
                        ct.id, ct.parent_id, ct.next_id, ct.type, ct.name AS content_name, ct.description AS content_description
                    FROM course_info ci
                    LEFT JOIN content_tree ct ON ci.course_id = ct.course_id
                    ORDER BY ct.parent_id NULLS FIRST, ct.next_id;
                `;
                    const values = [id];
                    const result = yield db.query(query, values);
                    const content = result.rows;
                    return buildCourse(content);
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
    CourseContent: {
        new(courseId, parentId, index, type, name, db) {
            return __awaiter(this, void 0, void 0, function* () {
                parentId = (parentId && parentId > 0) ? parentId : null;
                // Get next element
                let getNextId;
                let parameters;
                if (!parentId) {
                    getNextId = `
                    SELECT id
                    FROM "CourseContent"
                    WHERE parent_id IS NULL
                    ORDER BY next_id NULLS LAST LIMIT 1
                    OFFSET $1;
                `;
                    parameters = [index];
                }
                else {
                    getNextId = `
                    SELECT id
                    FROM "CourseContent"
                    WHERE parent_id = $1
                    ORDER BY next_id NULLS LAST LIMIT 1
                    OFFSET $2;
                `;
                    parameters = [parentId, index];
                }
                const nextIdRes = yield db.query(getNextId, parameters);
                let nextId = nextIdRes.rows.length > 0 ? nextIdRes.rows[0].id : null;
                // update previous element
                let futurePreviousId;
                if (index > 0) {
                    const getPreviousId = `
                    SELECT id FROM "CourseContent"
                    ${parentId ? 'WHERE parent_id = $2' : 'WHERE parent_id IS NULL'}
                    ORDER BY next_id NULLS LAST
                    LIMIT 1 OFFSET $1;
                `;
                    const params = parentId ? [index - 1, parentId] : [index - 1];
                    const getFuturePreviousIdRes = yield db.query(getPreviousId, params);
                    futurePreviousId = getFuturePreviousIdRes.rows.length > 0 ? getFuturePreviousIdRes.rows[0].id : null;
                }
                else {
                    futurePreviousId = null;
                }
                const query = `INSERT INTO "CourseContent" (course_id, parent_id, next_id, type, name) VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
                const values = [courseId, parentId || null, nextId || null, type, name];
                const { rows } = yield db.query(query, values);
                const id = rows[0].id;
                // update the new previous sibling with the inserted element as the next_id
                const updateFuturePrevious = `
                UPDATE "CourseContent"
                SET next_id = $1
                WHERE id = $2;
            `;
                yield db.query(updateFuturePrevious, [id, futurePreviousId]);
                return id;
            });
        },
        moveCourseContent(id, parentId, index, user, db) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                // Special case: Move to top level
                const newParentId = parentId === -1 ? null : parentId;
                // STEP 1: Remove from old position
                const getOldPreviousId = `
                SELECT id
                FROM "CourseContent"
                WHERE next_id = $1
            `;
                const oldPreviousId = ((_a = (yield db.query(getOldPreviousId, [id])).rows[0]) === null || _a === void 0 ? void 0 : _a.id) || null;
                const getOldNextId = `SELECT next_id
                                  FROM "CourseContent"
                                  WHERE id = $1`;
                const oldNextId = ((_b = (yield db.query(getOldNextId, [id])).rows[0]) === null || _b === void 0 ? void 0 : _b.next_id) || null;
                // unlink from old place: set next_id from previous element to the target elements next_id
                const unlink = `UPDATE "CourseContent"
                            SET next_id = $1
                            WHERE id = $2`;
                yield db.query(unlink, [oldNextId, oldPreviousId]);
                // STEP 2: Insert into new position
                let getFutureNextId;
                let parameters;
                if (parentId === -1) {
                    getFutureNextId = `
                    SELECT id
                    FROM "CourseContent"
                    WHERE parent_id IS NULL
                    AND id != $1
                    ORDER BY next_id NULLS LAST LIMIT 1
                    OFFSET $2;
                `;
                    parameters = [id, index];
                }
                else {
                    getFutureNextId = `
                    SELECT id
                    FROM "CourseContent"
                    WHERE parent_id = $1
                    AND id != $2  -- ignore itself
                    ORDER BY next_id NULLS LAST LIMIT 1
                    OFFSET $3;
                `;
                    parameters = [newParentId, id, index];
                }
                const getFutureNextIdRes = yield db.query(getFutureNextId, parameters);
                let futureNextId = getFutureNextIdRes.rows.length > 0 ? getFutureNextIdRes.rows[0].id : null;
                if (futureNextId === id)
                    futureNextId = oldNextId; // move operation could be stopped here
                // get the previous element at the new position
                let futurePreviousId;
                if (index > 0) {
                    const getFuturePreviousId = `
                    SELECT id FROM "CourseContent"
                    ${(parentId > 0) ? 'WHERE parent_id = $3' : 'WHERE parent_id IS NULL'}
                    AND id != $1  -- ignore itself
                    ORDER BY next_id NULLS LAST
                    LIMIT 1 OFFSET $2;
                `;
                    const params = (parentId > 0) ? [id, index - 1, newParentId] : [id, index - 1];
                    const getFuturePreviousIdRes = yield db.query(getFuturePreviousId, params);
                    futurePreviousId = getFuturePreviousIdRes.rows.length > 0 ? getFuturePreviousIdRes.rows[0].id : null;
                }
                else {
                    futurePreviousId = null;
                }
                // update the new previous sibling with the inserted element as the next_id
                const updateFuturePrevious = `
                UPDATE "CourseContent"
                SET next_id = $1
                WHERE id = $2;
            `;
                yield db.query(updateFuturePrevious, [id, futurePreviousId]);
                // insert new content
                const updateTarget = `
                UPDATE "CourseContent"
                SET parent_id = $1, next_id = $2
                WHERE id = $3;
            `;
                yield db.query(updateTarget, [newParentId, futureNextId, id]);
            });
        }
    }
};
/***** HELPER FUNCTIONS *****/
/**
 * Builds a single course with its hierarchical content.
 */
function buildCourse(items) {
    const contentMap = new Map();
    const nextMap = new Map(); // Stores next_id references
    const parentMap = new Map(); // Stores parent-child relationships
    const visited = new Set(); // Prevents infinite loops
    // Extract course attributes
    const course = {
        id: items[0].course_id,
        name: items[0].course_name,
        description: items[0].course_description,
        hidden: items[0].course_hidden,
        archived: items[0].course_archived
    };
    if (items.length === 1)
        return Object.assign(Object.assign({}, course), { content: [] });
    // Initialize maps
    items.forEach((item) => {
        contentMap.set(item.id, {
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            content: []
        });
        if (item.next_id) {
            nextMap.set(item.id, item.next_id);
        }
        if (!parentMap.has(item.parent_id)) {
            parentMap.set(item.parent_id, []);
        }
        parentMap.get(item.parent_id).push(item.id);
    });
    /**
     * Recursively builds the sorted content tree.
     */
    function getSortedChildren(parentId) {
        const children = parentMap.get(parentId) || [];
        if (children.length === 0)
            return [];
        const sortedChildren = [];
        let currentId = children.find((id) => ![...nextMap.values()].includes(id)); // Find starting node
        while (currentId !== undefined && !visited.has(currentId)) {
            visited.add(currentId); // Prevent infinite loops
            const node = contentMap.get(currentId);
            if (node) {
                node.content = getSortedChildren(node.id); // Recursively build children
                sortedChildren.push(node);
            }
            currentId = nextMap.get(currentId); // Move to next in order
        }
        return sortedChildren;
    }
    // Build the tree structure
    const rootContent = getSortedChildren(null);
    return Object.assign(Object.assign({}, course), { content: rootContent });
}
/**
 * Builds an array of courses from a flat list of items.
 */
function buildCourseHierarchy(items) {
    const coursesMap = new Map();
    // Group items by course_id
    items.forEach((item) => {
        if (!coursesMap.has(item.course_id)) {
            coursesMap.set(item.course_id, []);
        }
        coursesMap.get(item.course_id).push(item);
    });
    // Convert grouped data into structured courses
    return Array.from(coursesMap.values()).map((courseItems) => buildCourse(courseItems));
}
/***** ERRORS *****/
class RecordNotFound extends Error {
    constructor(message) {
        super();
        this.message = message || 'Record not found';
    }
}
