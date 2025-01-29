exports.up = function (knex) {
    return knex.schema.table('UserPasswords', (table) => {
        table.renameColumn('hash', 'salt') // Rename 'hash' column to 'salt'
    })
}

exports.down = function (knex) {
    return knex.schema.table('UserPasswords', (table) => {
        table.renameColumn('salt', 'hash') // Rename 'salt' column back to 'hash'
    })
}