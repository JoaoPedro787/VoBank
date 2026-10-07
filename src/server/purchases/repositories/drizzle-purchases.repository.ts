import { eq, and, gte, lt, ilike, isNull, inArray, type SQL } from "drizzle-orm";
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
  UpdatePurchaseParams,
  PurchaseWithRelations,
  ListPurchasesFilters,
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

  async updatePurchase(params: UpdatePurchaseParams): Promise<PurchaseWithRelations | null> {
    return await db.transaction(async (tx) => {
      // 1. Atualizar Purchase mestre
      const updateData: {
        updatedAt: Date;
        description?: string;
        purchaseDate?: Date;
      } = {
        updatedAt: new Date(),
      };
      if (params.purchase.description !== undefined) {
        updateData.description = params.purchase.description;
      }
      if (params.purchase.purchaseDate !== undefined) {
        updateData.purchaseDate = params.purchase.purchaseDate;
      }

      const [updatedPurchase] = await tx
        .update(purchases)
        .set(updateData)
        .where(and(eq(purchases.id, params.id), eq(purchases.userId, params.userId)))
        .returning();

      if (!updatedPurchase) {
        return null;
      }

      // 2. Se parcelas forem fornecidas, atualizar parcelas e splits
      if (params.installments && params.installments.length > 0) {
        const existingInsts = await tx
          .select()
          .from(installments)
          .where(eq(installments.purchaseId, updatedPurchase.id));

        for (const instData of params.installments) {
          const existingInst = existingInsts.find(
            (i) => i.installmentNumber === instData.installmentNumber,
          );

          let installmentId: string;
          if (existingInst) {
            installmentId = existingInst.id;
            await tx
              .update(installments)
              .set({
                amount: String(instData.amount),
                dueDate: instData.dueDate,
                billingMonth: instData.billingMonth,
                billingYear: instData.billingYear,
                updatedAt: new Date(),
              })
              .where(eq(installments.id, installmentId));

            // Deletar splits antigos dessa parcela
            await tx
              .delete(installmentSplits)
              .where(eq(installmentSplits.installmentId, installmentId));
          } else {
            const [createdInst] = await tx
              .insert(installments)
              .values({
                purchaseId: updatedPurchase.id,
                installmentNumber: instData.installmentNumber,
                amount: String(instData.amount),
                dueDate: instData.dueDate,
                billingMonth: instData.billingMonth,
                billingYear: instData.billingYear,
              })
              .returning();
            installmentId = createdInst.id;
          }

          // Inserir os novos splits dessa parcela
          if (instData.splits && instData.splits.length > 0) {
            await tx.insert(installmentSplits).values(
              instData.splits.map((s) => ({
                installmentId,
                personId: s.personId || null,
                amount: String(s.amount),
                percentage: s.percentage != null ? String(s.percentage) : null,
                isPaid: s.isPaid ?? false,
                paidAt: s.paidAt ?? null,
              })),
            );
          }
        }
      }

      // 3. Carregar compra completa com relações
      const fullPurchase = await tx.query.purchases.findFirst({
        where: eq(purchases.id, updatedPurchase.id),
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

      return (fullPurchase as unknown as PurchaseWithRelations) || null;
    });
  }

  async findByUserId(
    userId: string,
    filters?: ListPurchasesFilters,
  ): Promise<PurchaseWithRelations[]> {
    const conditions: SQL[] = [eq(purchases.userId, userId)];

    if (filters) {
      if (filters.search && filters.search.trim() !== "") {
        conditions.push(ilike(purchases.description, `%${filters.search.trim()}%`));
      }

      if (filters.year != null) {
        if (filters.month != null) {
          const start = new Date(Date.UTC(filters.year, filters.month - 1, 1, 0, 0, 0, 0));
          const end = new Date(Date.UTC(filters.year, filters.month, 1, 0, 0, 0, 0));
          conditions.push(gte(purchases.purchaseDate, start));
          conditions.push(lt(purchases.purchaseDate, end));
        } else {
          const start = new Date(Date.UTC(filters.year, 0, 1, 0, 0, 0, 0));
          const end = new Date(Date.UTC(filters.year + 1, 0, 1, 0, 0, 0, 0));
          conditions.push(gte(purchases.purchaseDate, start));
          conditions.push(lt(purchases.purchaseDate, end));
        }
      }

      if (filters.creditCardId && filters.creditCardId !== "all") {
        if (filters.creditCardId === "no-card" || filters.creditCardId === "none") {
          conditions.push(isNull(purchases.creditCardId));
        } else {
          conditions.push(eq(purchases.creditCardId, filters.creditCardId));
        }
      }

      if (filters.personId && filters.personId !== "all") {
        if (filters.personId === "user") {
          const matchingSplits = await db
            .selectDistinct({ purchaseId: installments.purchaseId })
            .from(installmentSplits)
            .innerJoin(installments, eq(installmentSplits.installmentId, installments.id))
            .where(isNull(installmentSplits.personId));

          const purchaseIds = matchingSplits.map((s) => s.purchaseId);
          if (purchaseIds.length === 0) {
            return [];
          }
          conditions.push(inArray(purchases.id, purchaseIds));
        } else {
          const matchingSplits = await db
            .selectDistinct({ purchaseId: installments.purchaseId })
            .from(installmentSplits)
            .innerJoin(installments, eq(installmentSplits.installmentId, installments.id))
            .where(eq(installmentSplits.personId, filters.personId));

          const purchaseIds = matchingSplits.map((s) => s.purchaseId);
          if (purchaseIds.length === 0) {
            return [];
          }
          conditions.push(inArray(purchases.id, purchaseIds));
        }
      }
    }

    const results = await db.query.purchases.findMany({
      where: and(...conditions),
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
