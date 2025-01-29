exports.up = function (knex) {
    return knex.schema.createTable('CourseStudents', (table) => {
        table.integer('course_id').references('id').inTable('Courses').onDelete('CASCADE')
        table.integer('student_id').references('id').inTable('Users').onDelete('CASCADE')
        table.primary(['course_id', 'student_id'])
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('CourseStudents')
}