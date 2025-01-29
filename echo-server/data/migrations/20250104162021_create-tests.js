exports.up = function (knex) {
    return knex.schema.createTable('Tests', (table) => {
        table.increments('id').primary()
        table.integer('lesson_id').references('id').inTable('Lessons').onDelete('CASCADE')
        table.string('name').notNullable()
        table.text('description')
        table.boolean('passed').defaultTo(false)
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('Tests')
}