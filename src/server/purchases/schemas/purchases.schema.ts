import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../auth/schemas/auth.schema";
import { creditCards } from "../../credit-cards/schemas/credit-cards.schema";
import { people } from "../../people/schemas/people.schema";

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "debit", "credit"]);

export const purchases = pgTable("purchases", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creditCardId: uuid("credit_card_id").references(() => creditCards.id, {
    onDelete: "set null",
  }),
  description: varchar("description", { length: 255 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date", { withTimezone: true }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("credit"),
  totalInstallments: integer("total_installments").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const installments = pgTable("installments", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseId: uuid("purchase_id")
    .notNull()
    .references(() => purchases.id, { onDelete: "cascade" }),
  installmentNumber: integer("installment_number").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  billingMonth: integer("billing_month").notNull(),
  billingYear: integer("billing_year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const installmentSplits = pgTable("installment_splits", {
  id: uuid("id").defaultRandom().primaryKey(),
  installmentId: uuid("installment_id")
    .notNull()
    .references(() => installments.id, { onDelete: "cascade" }),
  personId: uuid("person_id").references(() => people.id, {
    onDelete: "cascade",
  }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  creditCard: one(creditCards, {
    fields: [purchases.creditCardId],
    references: [creditCards.id],
  }),
  installments: many(installments),
}));

export const installmentsRelations = relations(installments, ({ one, many }) => ({
  purchase: one(purchases, {
    fields: [installments.purchaseId],
    references: [purchases.id],
  }),
  splits: many(installmentSplits),
}));

export const installmentSplitsRelations = relations(installmentSplits, ({ one }) => ({
  installment: one(installments, {
    fields: [installmentSplits.installmentId],
    references: [installments.id],
  }),
  person: one(people, {
    fields: [installmentSplits.personId],
    references: [people.id],
  }),
}));

// Zod Schemas
export const splitInputSchema = z.object({
  personId: z.string().uuid("ID de pessoa inválido").nullable().optional(),
  amount: z.coerce.number().positive("O valor do rateio deve ser positivo").optional(),
  percentage: z.coerce
    .number()
    .min(0, "A porcentagem não pode ser negativa")
    .max(100, "A porcentagem não pode ser maior que 100")
    .optional(),
});

export const createPurchaseSchema = z
  .object({
    description: z.string().trim().min(1, "A descrição da compra é obrigatória"),
    totalAmount: z.coerce.number().positive("O valor total da compra deve ser positivo"),
    purchaseDate: z.coerce.date().default(() => new Date()),
    paymentMethod: z.enum(["cash", "debit", "credit"], {
      errorMap: () => ({ message: "Método de pagamento inválido (cash, debit, credit)" }),
    }),
    creditCardId: z.string().uuid("ID do cartão inválido").optional().nullable(),
    totalInstallments: z.coerce
      .number()
      .int("A quantidade de parcelas deve ser inteira")
      .min(1, "A quantidade mínima de parcelas é 1")
      .default(1),
    splits: z.array(splitInputSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "credit" && !data.creditCardId) {
        return false;
      }
      return true;
    },
    {
      message: "O cartão de crédito é obrigatório para compras no crédito",
      path: ["creditCardId"],
    },
  );

export const updatePurchaseSchema = z.object({
  description: z.string().trim().min(1, "A descrição da compra é obrigatória").optional(),
  purchaseDate: z.coerce.date().optional(),
  paymentMethod: z
    .enum(["cash", "debit", "credit"], {
      errorMap: () => ({ message: "Método de pagamento inválido (cash, debit, credit)" }),
    })
    .optional(),
  creditCardId: z.string().uuid("ID do cartão inválido").optional().nullable(),
  totalAmount: z.coerce.number().positive("O valor total da compra deve ser positivo").optional(),
  totalInstallments: z.coerce
    .number()
    .int("A quantidade de parcelas deve ser inteira")
    .min(1, "A quantidade mínima de parcelas é 1")
    .optional(),
  splits: z.array(splitInputSchema).optional(),
});

export const createUpdatePurchaseWithInvarianceSchema = (original: {
  paymentMethod: string;
  creditCardId?: string | null;
  totalAmount: string | number;
  totalInstallments: number;
}) =>
  updatePurchaseSchema.superRefine((data, ctx) => {
    if (data.paymentMethod !== undefined && data.paymentMethod !== original.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Não é permitido alterar o método de pagamento da compra",
        path: ["paymentMethod"],
      });
    }
    if (
      data.creditCardId !== undefined &&
      (data.creditCardId || null) !== (original.creditCardId || null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Não é permitido alterar o cartão de crédito da compra",
        path: ["creditCardId"],
      });
    }
    if (
      data.totalAmount !== undefined &&
      Number(data.totalAmount) !== Number(original.totalAmount)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Não é permitido alterar o valor total da compra",
        path: ["totalAmount"],
      });
    }
    if (
      data.totalInstallments !== undefined &&
      data.totalInstallments !== original.totalInstallments
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Não é permitido alterar a quantidade de parcelas da compra",
        path: ["totalInstallments"],
      });
    }
  });

export function validatePurchaseInvariance(
  original: {
    paymentMethod: string;
    creditCardId?: string | null;
    totalAmount: string | number;
    totalInstallments: number;
  },
  update: {
    paymentMethod?: string;
    creditCardId?: string | null;
    totalAmount?: number | string;
    totalInstallments?: number;
  },
): void {
  if (update.paymentMethod !== undefined && update.paymentMethod !== original.paymentMethod) {
    throw new Error("Não é permitido alterar o método de pagamento da compra");
  }
  if (
    update.creditCardId !== undefined &&
    (update.creditCardId || null) !== (original.creditCardId || null)
  ) {
    throw new Error("Não é permitido alterar o cartão de crédito da compra");
  }
  if (
    update.totalAmount !== undefined &&
    Number(update.totalAmount) !== Number(original.totalAmount)
  ) {
    throw new Error("Não é permitido alterar o valor total da compra");
  }
  if (
    update.totalInstallments !== undefined &&
    update.totalInstallments !== original.totalInstallments
  ) {
    throw new Error("Não é permitido alterar a quantidade de parcelas da compra");
  }
}

export const toggleInstallmentSplitPaidSchema = z.object({
  isPaid: z.boolean({ required_error: "O status isPaid é obrigatório" }),
});

export const installmentSplitResponseSchema = z.object({
  id: z.string().uuid(),
  installmentId: z.string().uuid(),
  personId: z.string().uuid().nullable().optional(),
  amount: z.string(),
  percentage: z.string().nullable().optional(),
  isPaid: z.boolean(),
  paidAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const installmentResponseSchema = z.object({
  id: z.string().uuid(),
  purchaseId: z.string().uuid(),
  installmentNumber: z.number().int(),
  amount: z.string(),
  dueDate: z.date(),
  billingMonth: z.number().int(),
  billingYear: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  splits: z.array(installmentSplitResponseSchema).optional(),
});

export const purchaseResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  creditCardId: z.string().uuid().nullable().optional(),
  description: z.string(),
  totalAmount: z.string(),
  purchaseDate: z.date(),
  paymentMethod: z.enum(["cash", "debit", "credit"]),
  totalInstallments: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  installments: z.array(installmentResponseSchema).optional(),
});

// Inferred TypeScript Types
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
export type Installment = typeof installments.$inferSelect;
export type NewInstallment = typeof installments.$inferInsert;
export type InstallmentSplit = typeof installmentSplits.$inferSelect;
export type NewInstallmentSplit = typeof installmentSplits.$inferInsert;

export type CreateSplitInput = z.infer<typeof splitInputSchema>;
export type CreatePurchaseInput = z.input<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.input<typeof updatePurchaseSchema>;
export type UpdatePurchaseOutput = z.infer<typeof updatePurchaseSchema>;
export type ToggleInstallmentSplitPaidInput = z.infer<typeof toggleInstallmentSplitPaidSchema>;
export type PurchaseResponse = z.infer<typeof purchaseResponseSchema>;
export type InstallmentResponse = z.infer<typeof installmentResponseSchema>;
export type InstallmentSplitResponse = z.infer<typeof installmentSplitResponseSchema>;
