exports.up = function (knex) {
    return knex.schema.createTable('CourseTeachers', (table) => {
        table.integer('course_id').references('id').inTable('Courses').onDelete('CASCADE')
        table.integer('teacher_id').references('id').inTable('Users').onDelete('CASCADE')
        table.primary(['course_id', 'teacher_id'])
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('CourseTeachers')
}