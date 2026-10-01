import { eq, and } from "drizzle-orm";
import { db } from "../../shared/db";
import {
  purchases,
  installments,
  installmentSplits,
  InstallmentSplit,
  Purchase,
  Installment,
} from "../schemas/purchases.schema";
import {
  IPurchasesRepository,
  CreatePurchaseParams,
  PurchaseWithRelations,
} from "./purchases.repository.interface";

export class DrizzlePurchasesRepository implements IPurchasesRepository {
  async createPurchaseWithInstallments(
    params: CreatePurchaseParams,
  ): Promise<PurchaseWithRelations> {
    return await db.transaction(async (tx) => {
      // 1. Inserir Purchase mestre
      const [createdPurchase] = await tx
        .insert(purchases)
        .values({
          ...params.purchase,
          totalAmount: String(params.purchase.totalAmount),
        })
        .returning();

      // 2. Inserir cada parcela e seus splits
      for (const instData of params.installments) {
        const [createdInstallment] = await tx
          .insert(installments)
          .values({
            ...instData.installment,
            purchaseId: createdPurchase.id,
            amount: String(instData.installment.amount),
          })
          .returning();

        if (instData.splits.length > 0) {
          await tx.insert(installmentSplits).values(
            instData.splits.map((s) => ({
              ...s,
              installmentId: createdInstallment.id,
              amount: String(s.amount),
              percentage: s.percentage != null ? String(s.percentage) : null,
            })),
          );
        }
      }

      // 3. Carregar compra completa com relações
      const fullPurchase = await tx.query.purchases.findFirst({
        where: eq(purchases.id, createdPurchase.id),
        with: {
          creditCard: true,
          installments: {
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

      return fullPurchase as unknown as PurchaseWithRelations;
    });
  }

  async findByUserId(userId: string): Promise<PurchaseWithRelations[]> {
    const results = await db.query.purchases.findMany({
      where: eq(purchases.userId, userId),
      orderBy: (p, { desc }) => [desc(p.purchaseDate)],
      with: {
        creditCard: true,
        installments: {
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

    return results as unknown as PurchaseWithRelations[];
  }

  async findById(id: string, userId: string): Promise<PurchaseWithRelations | null> {
    const result = await db.query.purchases.findFirst({
      where: and(eq(purchases.id, id), eq(purchases.userId, userId)),
      with: {
        creditCard: true,
        installments: {
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

    return (result as unknown as PurchaseWithRelations) || null;
  }

  async findSplitById(
    splitId: string,
    userId: string,
  ): Promise<{
    split: InstallmentSplit;
    installment: Installment;
    purchase: Purchase;
  } | null> {
    const splitResult = await db.query.installmentSplits.findFirst({
      where: eq(installmentSplits.id, splitId),
      with: {
        installment: {
          with: {
            purchase: true,
          },
        },
      },
    });

    if (
      !splitResult ||
      !splitResult.installment ||
      !splitResult.installment.purchase ||
      splitResult.installment.purchase.userId !== userId
    ) {
      return null;
    }

    return {
      split: splitResult,
      installment: splitResult.installment,
      purchase: splitResult.installment.purchase,
    };
  }

  async toggleSplitPaid(
    splitId: string,
    isPaid: boolean,
    paidAt?: Date | null,
  ): Promise<InstallmentSplit | null> {
    const [updated] = await db
      .update(installmentSplits)
      .set({
        isPaid,
        paidAt: isPaid ? paidAt || new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(installmentSplits.id, splitId))
      .returning();

    return updated || null;
  }

  async deletePurchase(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(purchases)
      .where(and(eq(purchases.id, id), eq(purchases.userId, userId)))
      .returning();

    return result.length > 0;
  }
}
