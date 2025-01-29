exports.up = function (knex) {
    return knex.schema.createTable('Lessons', (table) => {
        table.increments('id').primary()
        table.integer('chapter_id').references('id').inTable('Chapters').onDelete('SET NULL')
        table.string('name').notNullable()
        table.text('description')
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('Lessons')
}