import { eq, and } from "drizzle-orm";
import { db } from "../../shared/db";
import { purchases, installments } from "../../purchases/schemas/purchases.schema";
import { IDashboardRepository, DashboardInstallmentData } from "./dashboard.repository.interface";

export class DrizzleDashboardRepository implements IDashboardRepository {
  async findMonthlyInstallments(
    userId: string,
    month: number,
    year: number,
  ): Promise<DashboardInstallmentData[]> {
    const userPurchases = await db.query.purchases.findMany({
      where: eq(purchases.userId, userId),
      with: {
        creditCard: true,
        installments: {
          where: and(eq(installments.billingMonth, month), eq(installments.billingYear, year)),
          orderBy: (inst, { asc }) => [asc(inst.installmentNumber)],
          with: {
            splits: {
              with: {
                person: true,
              },
            },
          },
        },
      },
    });

    const result: DashboardInstallmentData[] = [];

    for (const p of userPurchases) {
      if (p.installments && p.installments.length > 0) {
        for (const inst of p.installments) {
          result.push({
            installment: {
              id: inst.id,
              purchaseId: inst.purchaseId,
              installmentNumber: inst.installmentNumber,
              amount: inst.amount,
              dueDate: inst.dueDate,
              billingMonth: inst.billingMonth,
              billingYear: inst.billingYear,
              createdAt: inst.createdAt,
              updatedAt: inst.updatedAt,
            },
            purchase: {
              id: p.id,
              description: p.description,
              paymentMethod: p.paymentMethod,
              totalInstallments: p.totalInstallments,
              creditCard: p.creditCard
                ? {
                    id: p.creditCard.id,
                    name: p.creditCard.name,
                    color: p.creditCard.color,
                  }
                : null,
            },
            splits: inst.splits || [],
          });
        }
      }
    }

    return result;
  }
}
