import { z } from "zod";

export const dashboardQuerySchema = z.object({
  month: z.coerce
    .number()
    .int("O mês deve ser um número inteiro")
    .min(1, "O mês deve ser entre 1 e 12")
    .max(12, "O mês deve ser entre 1 e 12")
    .optional(),
  year: z.coerce
    .number()
    .int("O ano deve ser um número inteiro")
    .min(2000, "Ano mínimo é 2000")
    .max(2100, "Ano máximo é 2100")
    .optional(),
  referenceDate: z.string().optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

export interface DashboardSplitItem {
  id: string;
  installmentId: string;
  purchaseId: string;
  purchaseDescription: string;
  paymentMethod: "cash" | "debit" | "credit";
  creditCardName: string | null;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  billingMonth: number;
  billingYear: number;
  isPaid: boolean;
  paidAt: string | null;
  isOverdue: boolean;
}

export interface PersonDashboardSummary {
  personId: string | null;
  name: string;
  color: string;
  isUser: boolean;
  totalCommitted: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  totalSplitsCount: number;
  splits: DashboardSplitItem[];
}

export interface DashboardResponse {
  month: number;
  year: number;
  totalCommitted: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  installmentsCount: number;
  byPerson: PersonDashboardSummary[];
}
