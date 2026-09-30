import { pgTable, uuid, varchar, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../auth/schemas/auth.schema";
import { purchases } from "../../purchases/schemas/purchases.schema";
import { HEX_COLOR_REGEX } from "../../../shared/constants/colors";

export const creditCards = pgTable("credit_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  flag: varchar("flag", { length: 50 }).notNull().default("Outro"),
  color: varchar("color", { length: 7 }).notNull(),
  closingDay: integer("closing_day").notNull(),
  dueDay: integer("due_day").notNull(),
  limit: numeric("limit", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const creditCardsRelations = relations(creditCards, ({ one, many }) => ({
  user: one(users, {
    fields: [creditCards.userId],
    references: [users.id],
  }),
  purchases: many(purchases),
}));

// Zod Schemas
export const createCreditCardSchema = z.object({
  name: z.string().trim().min(1, "O nome do cartão é obrigatório"),
  flag: z.string().trim().min(1, "A bandeira/banco é obrigatória").default("Outro"),
  color: z
    .string()
    .trim()
    .regex(HEX_COLOR_REGEX, "A cor deve estar no formato hexadecimal #RRGGBB (ex: #8A05BE)"),
  closingDay: z.coerce
    .number()
    .int("O dia de fechamento deve ser um número inteiro")
    .min(1, "O dia de fechamento deve ser entre 1 e 31")
    .max(31, "O dia de fechamento deve ser entre 1 e 31"),
  dueDay: z.coerce
    .number()
    .int("O dia de vencimento deve ser um número inteiro")
    .min(1, "O dia de vencimento deve ser entre 1 e 31")
    .max(31, "O dia de vencimento deve ser entre 1 e 31"),
  limit: z.coerce.number().positive("O limite deve ser um valor positivo").optional().nullable(),
});

export const updateCreditCardSchema = createCreditCardSchema.partial();

export const creditCardResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  flag: z.string(),
  color: z.string(),
  closingDay: z.number().int(),
  dueDay: z.number().int(),
  limit: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Inferred TypeScript Types
export type CreditCard = typeof creditCards.$inferSelect;
export type NewCreditCard = typeof creditCards.$inferInsert;
export type CreateCreditCardInput = z.input<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.input<typeof updateCreditCardSchema>;
export type CreditCardResponse = z.infer<typeof creditCardResponseSchema>;
