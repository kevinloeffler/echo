exports.up = function (knex) {
    return knex.schema.createTable('Courses', (table) => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('description')
        table.boolean('hidden').defaultTo(false)
        table.boolean('archived').defaultTo(false)
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('Courses')
}