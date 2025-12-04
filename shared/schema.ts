import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  major: text("major").notNull(),
  year: text("year").notNull(),
  classes: text("classes").array().notNull().default(sql`ARRAY[]::text[]`),
  availableSlots: text("available_slots").array().notNull().default(sql`ARRAY[]::text[]`),
});

export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: text("requester_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  status: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;
