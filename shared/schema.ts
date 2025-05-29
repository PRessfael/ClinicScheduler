import { pgTable, text, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userTypeEnum = z.enum(["admin", "doctor", "user"]);
export type UserType = z.infer<typeof userTypeEnum>;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(),
  email: varchar("email", { length: 100 }).notNull().default(''),
  username: varchar("username").unique(),
  user_type: text("user_type").notNull().default("user"),
  created_at: timestamp("created_at").defaultNow(),
  phone: text("phone").unique()
});

export const patients = pgTable("patients", {
  patient_id: varchar("patient_id", { length: 10 }).primaryKey(),
  user_id: uuid("user_id").unique().references(() => users.id, { onUpdate: "cascade", onDelete: "set null" }),
  first_name: text("first_name"),
  last_name: text("last_name"),
  age: integer("age")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  user_type: true,
  phone: true
}).extend({
  user_type: userTypeEnum.optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
