exports.up = function (knex) {
    return knex.schema.createTable('Code', (table) => {
        table.increments('id').primary()
        table.integer('user_id').references('id').inTable('Users').onDelete('CASCADE')
        table.integer('lesson_id').references('id').inTable('Lessons').onDelete('CASCADE')
        table.text('code').notNullable()
        table.timestamp('timestamp').defaultTo(knex.fn.now())
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('Submissions')
}