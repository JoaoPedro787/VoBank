import { Installment, InstallmentSplit } from "../../purchases/schemas/purchases.schema";

export type DashboardSplitWithPerson = InstallmentSplit & {
  person?: { id: string; name: string; color: string } | null;
};

export interface DashboardInstallmentData {
  installment: Installment;
  purchase: {
    id: string;
    description: string;
    paymentMethod: "cash" | "debit" | "credit";
    totalInstallments: number;
    creditCard?: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  splits: DashboardSplitWithPerson[];
}

export interface IDashboardRepository {
  findMonthlyInstallments(
    userId: string,
    month: number,
    year: number,
  ): Promise<DashboardInstallmentData[]>;
}
