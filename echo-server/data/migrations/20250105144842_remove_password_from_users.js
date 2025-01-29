exports.up = function (knex) {
    return knex.schema.table('Users', (table) => {
        table.dropColumn('password')
    }).then(() => {
        return knex.schema.createTable('UserPasswords', (table) => {
            table.increments('id').primary()
            table.integer('user_id').unsigned().notNullable()
            table.foreign('user_id').references('Users.id').onDelete('CASCADE')
            table.text('password').notNullable()
            table.text('hash').notNullable()
        })
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable('UserPasswords').then(() => {
        return knex.schema.table('Users', (table) => {
            table.text('password').notNullable()
        })
    })
}