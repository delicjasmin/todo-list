import { relations } from "drizzle-orm";
import { mysqlTable, text, boolean, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable('users', {
  id: varchar("id", { length: 256 }).primaryKey(),
  username: varchar("username", { length: 256 }).unique(),
  name: varchar("name", { length: 256 })
});

export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}));

export const todos = mysqlTable("todos", {
  id: varchar("id", { length: 256 }).primaryKey(),
  label: text("label"),
  done: boolean("done"),
  username: varchar("username", { length: 256 })
})

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.username],
    references: [users.username],
  }),
}));