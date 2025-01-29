exports.up = function (knex) {
    return knex.schema.createTable('Chapters', (table) => {
        table.increments('id').primary()
        table.integer('course_id').references('id').inTable('Courses').onDelete('CASCADE')
        table.integer('parent_id').references('id').inTable('Chapters').onDelete('SET NULL')
        table.string('name').notNullable()
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('Chapters')
}