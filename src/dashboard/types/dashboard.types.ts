export interface DashboardSplitItemClient {
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

export interface PersonDashboardSummaryClient {
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
  splits: DashboardSplitItemClient[];
}

export interface DashboardResponseClient {
  month: number;
  year: number;
  totalCommitted: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  installmentsCount: number;
  byPerson: PersonDashboardSummaryClient[];
}
