import { Purchase, Installment, InstallmentSplit } from "../schemas/purchases.schema";
import {
  IPurchasesRepository,
  CreatePurchaseParams,
  UpdatePurchaseParams,
  PurchaseWithRelations,
  InstallmentWithSplits,
  ListPurchasesFilters,
} from "./purchases.repository.interface";
import { CreditCard } from "../../credit-cards/schemas/credit-cards.schema";
import { Person } from "../../people/schemas/people.schema";

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export class InMemoryPurchasesRepository implements IPurchasesRepository {
  private purchases: Purchase[] = [];
  private installments: Installment[] = [];
  private installmentSplits: InstallmentSplit[] = [];

  // Dados auxiliares opcionais para relações
  private cards: CreditCard[] = [];
  private people: Person[] = [];

  setCards(cards: CreditCard[]): void {
    this.cards = cards;
  }

  setPeople(people: Person[]): void {
    this.people = people;
  }

  async createPurchaseWithInstallments(
    params: CreatePurchaseParams,
  ): Promise<PurchaseWithRelations> {
    const now = new Date();
    const purchaseId = params.purchase.id || generateId("purch");

    const newPurchase: Purchase = {
      id: purchaseId,
      userId: params.purchase.userId,
      creditCardId: params.purchase.creditCardId || null,
      description: params.purchase.description,
      totalAmount: String(params.purchase.totalAmount),
      purchaseDate: params.purchase.purchaseDate || now,
      paymentMethod: params.purchase.paymentMethod || "credit",
      totalInstallments: params.purchase.totalInstallments || 1,
      createdAt: params.purchase.createdAt || now,
      updatedAt: params.purchase.updatedAt || now,
    };

    this.purchases.push(newPurchase);

    const createdInstallmentsWithSplits: InstallmentWithSplits[] = [];

    for (const instParam of params.installments) {
      const installmentId = generateId("inst");
      const newInstallment: Installment = {
        id: installmentId,
        purchaseId,
        installmentNumber: instParam.installment.installmentNumber,
        amount: String(instParam.installment.amount),
        dueDate: instParam.installment.dueDate,
        billingMonth: instParam.installment.billingMonth,
        billingYear: instParam.installment.billingYear,
        createdAt: now,
        updatedAt: now,
      };

      this.installments.push(newInstallment);

      const createdSplits = [];
      for (const splitParam of instParam.splits) {
        const splitId = generateId("split");
        const newSplit: InstallmentSplit = {
          id: splitId,
          installmentId,
          personId: splitParam.personId || null,
          amount: String(splitParam.amount),
          percentage: splitParam.percentage != null ? String(splitParam.percentage) : null,
          isPaid: splitParam.isPaid || false,
          paidAt: splitParam.paidAt || null,
          createdAt: now,
          updatedAt: now,
        };

        this.installmentSplits.push(newSplit);

        const person = newSplit.personId
          ? this.people.find((p) => p.id === newSplit.personId)
          : null;

        createdSplits.push({
          ...newSplit,
          person: person ? { id: person.id, name: person.name, color: person.color } : null,
        });
      }

      createdInstallmentsWithSplits.push({
        ...newInstallment,
        splits: createdSplits,
      });
    }

    const card = newPurchase.creditCardId
      ? this.cards.find((c) => c.id === newPurchase.creditCardId)
      : null;

    return {
      ...newPurchase,
      creditCard: card
        ? {
            id: card.id,
            name: card.name,
            flag: card.flag,
            color: card.color,
            closingDay: card.closingDay,
            dueDay: card.dueDay,
          }
        : null,
      installments: createdInstallmentsWithSplits,
    };
  }

  async updatePurchase(params: UpdatePurchaseParams): Promise<PurchaseWithRelations | null> {
    const pIndex = this.purchases.findIndex(
      (p) => p.id === params.id && p.userId === params.userId,
    );
    if (pIndex === -1) return null;

    const now = new Date();
    const currentPurchase = this.purchases[pIndex];

    const updatedPurchase: Purchase = {
      ...currentPurchase,
      description: params.purchase.description ?? currentPurchase.description,
      purchaseDate: params.purchase.purchaseDate ?? currentPurchase.purchaseDate,
      updatedAt: now,
    };
    this.purchases[pIndex] = updatedPurchase;

    if (params.installments && params.installments.length > 0) {
      for (const instData of params.installments) {
        const inst = this.installments.find(
          (i) =>
            i.purchaseId === updatedPurchase.id &&
            i.installmentNumber === instData.installmentNumber,
        );

        let installmentId: string;
        if (inst) {
          installmentId = inst.id;
          inst.amount = String(instData.amount);
          inst.dueDate = instData.dueDate;
          inst.billingMonth = instData.billingMonth;
          inst.billingYear = instData.billingYear;
          inst.updatedAt = now;

          // Remover splits existentes dessa parcela
          this.installmentSplits = this.installmentSplits.filter(
            (s) => s.installmentId !== installmentId,
          );
        } else {
          installmentId = instData.id || generateId("inst");
          const newInst: Installment = {
            id: installmentId,
            purchaseId: updatedPurchase.id,
            installmentNumber: instData.installmentNumber,
            amount: String(instData.amount),
            dueDate: instData.dueDate,
            billingMonth: instData.billingMonth,
            billingYear: instData.billingYear,
            createdAt: now,
            updatedAt: now,
          };
          this.installments.push(newInst);
        }

        for (const s of instData.splits) {
          const splitId = s.id || generateId("split");
          const newSplit: InstallmentSplit = {
            id: splitId,
            installmentId,
            personId: s.personId || null,
            amount: String(s.amount),
            percentage: s.percentage != null ? String(s.percentage) : null,
            isPaid: s.isPaid ?? false,
            paidAt: s.paidAt ?? null,
            createdAt: now,
            updatedAt: now,
          };
          this.installmentSplits.push(newSplit);
        }
      }
    }

    return await this.findById(params.id, params.userId);
  }

  async findByUserId(
    userId: string,
    filters?: ListPurchasesFilters,
  ): Promise<PurchaseWithRelations[]> {
    let userPurchases = this.purchases.filter((p) => p.userId === userId);

    if (filters) {
      if (filters.search && filters.search.trim() !== "") {
        const query = filters.search.trim().toLowerCase();
        userPurchases = userPurchases.filter((p) => p.description.toLowerCase().includes(query));
      }

      if (filters.year != null) {
        userPurchases = userPurchases.filter((p) => {
          const d = new Date(p.purchaseDate);
          if (isNaN(d.getTime())) return false;
          const yearMatches = d.getUTCFullYear() === filters.year;
          if (filters.month != null) {
            return yearMatches && d.getUTCMonth() + 1 === filters.month;
          }
          return yearMatches;
        });
      } else if (filters.month != null) {
        userPurchases = userPurchases.filter((p) => {
          const d = new Date(p.purchaseDate);
          if (isNaN(d.getTime())) return false;
          return d.getUTCMonth() + 1 === filters.month;
        });
      }

      if (filters.creditCardId && filters.creditCardId !== "all") {
        if (filters.creditCardId === "no-card" || filters.creditCardId === "none") {
          userPurchases = userPurchases.filter((p) => p.creditCardId == null);
        } else {
          userPurchases = userPurchases.filter((p) => p.creditCardId === filters.creditCardId);
        }
      }

      if (filters.personId && filters.personId !== "all") {
        userPurchases = userPurchases.filter((purchase) => {
          const purchaseInstallments = this.installments.filter(
            (inst) => inst.purchaseId === purchase.id,
          );
          const purchaseSplits = this.installmentSplits.filter((s) =>
            purchaseInstallments.some((inst) => inst.id === s.installmentId),
          );

          if (filters.personId === "user") {
            if (purchaseSplits.length === 0) return true;
            return purchaseSplits.some((s) => s.personId == null);
          }

          return purchaseSplits.some((s) => s.personId === filters.personId);
        });
      }
    }

    userPurchases.sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
    );

    return userPurchases.map((purchase) => {
      const card = purchase.creditCardId
        ? this.cards.find((c) => c.id === purchase.creditCardId)
        : null;

      const insts = this.installments
        .filter((inst) => inst.purchaseId === purchase.id)
        .sort((a, b) => a.installmentNumber - b.installmentNumber)
        .map((inst) => {
          const splits = this.installmentSplits
            .filter((s) => s.installmentId === inst.id)
            .map((s) => {
              const person = s.personId ? this.people.find((p) => p.id === s.personId) : null;
              return {
                ...s,
                person: person ? { id: person.id, name: person.name, color: person.color } : null,
              };
            });

          return {
            ...inst,
            splits,
          };
        });

      return {
        ...purchase,
        creditCard: card
          ? {
              id: card.id,
              name: card.name,
              flag: card.flag,
              color: card.color,
              closingDay: card.closingDay,
              dueDay: card.dueDay,
            }
          : null,
        installments: insts,
      };
    });
  }

  async findById(id: string, userId: string): Promise<PurchaseWithRelations | null> {
    const all = await this.findByUserId(userId);
    return all.find((p) => p.id === id) || null;
  }

  async findSplitById(
    splitId: string,
    userId: string,
  ): Promise<{
    split: InstallmentSplit;
    installment: Installment;
    purchase: Purchase;
  } | null> {
    const split = this.installmentSplits.find((s) => s.id === splitId);
    if (!split) return null;

    const installment = this.installments.find((i) => i.id === split.installmentId);
    if (!installment) return null;

    const purchase = this.purchases.find(
      (p) => p.id === installment.purchaseId && p.userId === userId,
    );
    if (!purchase) return null;

    return {
      split: { ...split },
      installment: { ...installment },
      purchase: { ...purchase },
    };
  }

  async toggleSplitPaid(
    splitId: string,
    isPaid: boolean,
    paidAt?: Date | null,
  ): Promise<InstallmentSplit | null> {
    const index = this.installmentSplits.findIndex((s) => s.id === splitId);
    if (index === -1) return null;

    const updated: InstallmentSplit = {
      ...this.installmentSplits[index],
      isPaid,
      paidAt: isPaid ? paidAt || new Date() : null,
      updatedAt: new Date(),
    };

    this.installmentSplits[index] = updated;
    return { ...updated };
  }

  async deletePurchase(id: string, userId: string): Promise<boolean> {
    const pIndex = this.purchases.findIndex((p) => p.id === id && p.userId === userId);
    if (pIndex === -1) return false;

    const purchase = this.purchases[pIndex];
    const instIds = this.installments.filter((i) => i.purchaseId === purchase.id).map((i) => i.id);

    this.installmentSplits = this.installmentSplits.filter(
      (s) => !instIds.includes(s.installmentId),
    );
    this.installments = this.installments.filter((i) => i.purchaseId !== purchase.id);
    this.purchases.splice(pIndex, 1);

    return true;
  }

  clear(): void {
    this.purchases = [];
    this.installments = [];
    this.installmentSplits = [];
    this.cards = [];
    this.people = [];
  }
}
