exports.up = function (knex) {
    return knex.schema.createTable('Users', (table) => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.string('mail').notNullable().unique()
        table.text('password').notNullable()
        table.enu('role', ['Admin', 'Teacher', 'Student']).notNullable()
        table.text('profile_picture')
        table.text('organisation')
        table.text('link')
        table.text('description')
        table.boolean('archived').defaultTo(false)
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('Users')
}