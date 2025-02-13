export async function up(knex) {
    // Drop foreign key constraints referencing Lessons and Chapters
    await knex.schema.alterTable("Code", (table) => {
        table.dropForeign(["lesson_id"]);
    });

    await knex.schema.alterTable("Tests", (table) => {
        table.dropForeign(["lesson_id"]);
    });

    await knex.schema.alterTable("Chapters", (table) => {
        table.dropForeign(["parent_id"]);
        table.dropForeign(["course_id"]);
    });

    // Drop the old tables
    await knex.schema.dropTableIfExists("Lessons");
    await knex.schema.dropTableIfExists("Chapters");

    // Create the new unified CourseContent table
    await knex.schema.createTable("CourseContent", (table) => {
        table.increments("id").primary();
        table.integer("course_id").notNullable().references("id").inTable("Courses").onDelete("CASCADE");
        table.integer("parent_id").nullable().references("id").inTable("CourseContent").onDelete("SET NULL"); // Defines hierarchy
        table.integer("next_id").nullable().references("id").inTable("CourseContent").onDelete("SET NULL"); // Linked list ordering
        table.enu("type", ["chapter", "lesson"]).notNullable(); // Differentiates chapters from lessons
        table.string("name", 255).notNullable();
        table.text("description").nullable();
    });

    // Add index for efficient tree traversal
    await knex.schema.table("CourseContent", (table) => {
        table.index(["course_id"]);
        table.index(["parent_id"]);
        table.index(["next_id"]);
    });

    // Modify the existing lesson_id column in Code and Tests to reference CourseContent
    await knex.schema.alterTable("Code", (table) => {
        table.foreign("lesson_id").references("id").inTable("CourseContent").onDelete("CASCADE");
    });

    await knex.schema.alterTable("Tests", (table) => {
        table.foreign("lesson_id").references("id").inTable("CourseContent").onDelete("CASCADE");
    });
}

export async function down(knex) {
    // Drop the new table
    await knex.schema.dropTableIfExists("CourseContent");

    // Recreate the original Chapters table
    await knex.schema.createTable("Chapters", (table) => {
        table.increments("id").primary();
        table.integer("course_id").notNullable().references("id").inTable("Courses").onDelete("CASCADE");
        table.integer("parent_id").nullable().references("id").inTable("Chapters").onDelete("SET NULL");
        table.string("name", 255).notNullable();
    });

    // Recreate the original Lessons table
    await knex.schema.createTable("Lessons", (table) => {
        table.increments("id").primary();
        table.integer("chapter_id").nullable().references("id").inTable("Chapters").onDelete("SET NULL");
        table.string("name", 255).notNullable();
        table.text("description").nullable();
    });

    // Restore foreign keys in Code and Tests
    await knex.schema.alterTable("Code", (table) => {
        table.dropForeign(["lesson_id"]);
        table.foreign("lesson_id").references("id").inTable("Lessons").onDelete("CASCADE");
    });

    await knex.schema.alterTable("Tests", (table) => {
        table.dropForeign(["lesson_id"]);
        table.foreign("lesson_id").references("id").inTable("Lessons").onDelete("CASCADE");
    });
}