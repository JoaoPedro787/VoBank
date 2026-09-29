import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../auth/schemas/auth.schema";
import { installmentSplits } from "../../purchases/schemas/purchases.schema";
import { HEX_COLOR_REGEX } from "../../../shared/constants/colors";

export const people = pgTable("people", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const peopleRelations = relations(people, ({ one, many }) => ({
  user: one(users, {
    fields: [people.userId],
    references: [users.id],
  }),
  splits: many(installmentSplits),
}));

// Zod Schemas
export const createPersonSchema = z.object({
  name: z.string().trim().min(1, "O nome da pessoa é obrigatório"),
  color: z
    .string()
    .trim()
    .regex(HEX_COLOR_REGEX, "A cor deve estar no formato hexadecimal #RRGGBB (ex: #3B82F6)"),
});

export const updatePersonSchema = createPersonSchema.partial();

export const personResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Inferred TypeScript Types
export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
export type PersonResponse = z.infer<typeof personResponseSchema>;
