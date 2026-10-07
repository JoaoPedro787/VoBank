import {
  CreatePurchaseInput,
  createPurchaseSchema,
  UpdatePurchaseInput,
  updatePurchaseSchema,
  InstallmentSplit,
  listPurchasesQuerySchema,
  ListPurchasesFilters,
} from "../schemas/purchases.schema";
import {
  IPurchasesRepository,
  PurchaseWithRelations,
} from "../repositories/purchases.repository.interface";
import { ICreditCardsRepository } from "../../credit-cards/repositories/credit-cards.repository.interface";
import { IPeopleRepository } from "../../people/repositories/people.repository.interface";
import { NotFoundError, BadRequestError } from "../../shared/errors/app-error";
import {
  calculateInstallmentDates,
  InstallmentDateResult,
} from "../../../shared/utils/invoice-cycle";
import { calculatePurchaseSplitsAndInstallments } from "../../../shared/utils/purchase-split";

export class PurchasesService {
  constructor(
    private purchasesRepo: IPurchasesRepository,
    private cardsRepo: ICreditCardsRepository,
    private peopleRepo: IPeopleRepository,
  ) {}

  async createPurchase(userId: string, input: CreatePurchaseInput): Promise<PurchaseWithRelations> {
    const validated = createPurchaseSchema.parse(input);

    let cardData: { closingDay: number; dueDay: number } | null = null;

    if (validated.paymentMethod === "credit") {
      if (!validated.creditCardId) {
        throw new BadRequestError("Cartão de crédito é obrigatório para compras no crédito");
      }

      const card = await this.cardsRepo.findById(validated.creditCardId, userId);
      if (!card) {
        throw new NotFoundError("Cartão de crédito não encontrado");
      }

      cardData = {
        closingDay: card.closingDay,
        dueDay: card.dueDay,
      };
    }

    // Validar se todas as pessoas nos splits pertencem ao usuário
    if (validated.splits && validated.splits.length > 0) {
      for (const split of validated.splits) {
        if (split.personId) {
          const person = await this.peopleRepo.findById(split.personId, userId);
          if (!person) {
            throw new NotFoundError(`Pessoa vinculada ao rateio não foi encontrada`);
          }
        }
      }
    }

    // 1. Calcular datas de vencimento das parcelas
    const installmentDates = calculateInstallmentDates({
      purchaseDate: validated.purchaseDate,
      paymentMethod: validated.paymentMethod,
      totalInstallments: validated.totalInstallments,
      card: cardData,
    });

    // 2. Calcular divisão matemática exata de parcelas e rateios
    const calculatedInstallments = calculatePurchaseSplitsAndInstallments({
      totalAmount: validated.totalAmount,
      totalInstallments: validated.totalInstallments,
      installmentDates,
      splits: validated.splits,
    });

    // 3. Persistir compra, parcelas e rateios
    return await this.purchasesRepo.createPurchaseWithInstallments({
      purchase: {
        userId,
        creditCardId: validated.paymentMethod === "credit" ? validated.creditCardId : null,
        description: validated.description,
        totalAmount: String(validated.totalAmount),
        purchaseDate: validated.purchaseDate,
        paymentMethod: validated.paymentMethod,
        totalInstallments: validated.totalInstallments,
      },
      installments: calculatedInstallments.map((inst) => ({
        installment: {
          installmentNumber: inst.installmentNumber,
          amount: String(inst.amount),
          dueDate: inst.dueDate,
          billingMonth: inst.billingMonth,
          billingYear: inst.billingYear,
        },
        splits: inst.splits.map((split) => ({
          personId: split.personId,
          amount: String(split.amount),
          percentage: split.percentage != null ? String(split.percentage) : null,
          isPaid: false,
          paidAt: null,
        })),
      })),
    });
  }

  async updatePurchase(
    id: string,
    userId: string,
    input: UpdatePurchaseInput,
  ): Promise<PurchaseWithRelations> {
    const validated = updatePurchaseSchema.parse(input);

    const existing = await this.purchasesRepo.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Compra não encontrada");
    }

    // Bloquear mutações estruturais (invariância)
    if (
      validated.paymentMethod !== undefined &&
      validated.paymentMethod !== existing.paymentMethod
    ) {
      throw new BadRequestError("Não é permitido alterar o método de pagamento da compra");
    }

    if (
      validated.creditCardId !== undefined &&
      (validated.creditCardId || null) !== (existing.creditCardId || null)
    ) {
      throw new BadRequestError("Não é permitido alterar o cartão de crédito da compra");
    }

    if (
      validated.totalAmount !== undefined &&
      Number(validated.totalAmount) !== Number(existing.totalAmount)
    ) {
      throw new BadRequestError("Não é permitido alterar o valor total da compra");
    }

    if (
      validated.totalInstallments !== undefined &&
      validated.totalInstallments !== existing.totalInstallments
    ) {
      throw new BadRequestError("Não é permitido alterar a quantidade de parcelas da compra");
    }

    // Validar se todas as pessoas nos novos splits pertencem ao usuário
    if (validated.splits && validated.splits.length > 0) {
      for (const split of validated.splits) {
        if (split.personId) {
          const person = await this.peopleRepo.findById(split.personId, userId);
          if (!person) {
            throw new NotFoundError("Pessoa vinculada ao rateio não foi encontrada");
          }
        }
      }
    }

    const targetPurchaseDate = validated.purchaseDate || existing.purchaseDate;
    const dateChanged =
      validated.purchaseDate !== undefined &&
      new Date(validated.purchaseDate).getTime() !== new Date(existing.purchaseDate).getTime();
    const splitsChanged = validated.splits !== undefined;

    // Calcular datas das parcelas (recalcular se a data mudou, ou preservar datas existentes)
    let installmentDates: InstallmentDateResult[];

    if (dateChanged) {
      let cardData: { closingDay: number; dueDay: number } | null = null;
      if (existing.paymentMethod === "credit" && existing.creditCardId) {
        const card = await this.cardsRepo.findById(existing.creditCardId, userId);
        if (card) {
          cardData = {
            closingDay: card.closingDay,
            dueDay: card.dueDay,
          };
        }
      }

      installmentDates = calculateInstallmentDates({
        purchaseDate: targetPurchaseDate,
        paymentMethod: existing.paymentMethod,
        totalInstallments: existing.totalInstallments,
        card: cardData,
      });
    } else {
      const sortedExisting = [...existing.installments].sort(
        (a, b) => a.installmentNumber - b.installmentNumber,
      );
      installmentDates = sortedExisting.map((inst) => ({
        installmentNumber: inst.installmentNumber,
        dueDate: inst.dueDate,
        billingMonth: inst.billingMonth,
        billingYear: inst.billingYear,
      }));
    }

    // Se houver alteração de splits, calcular a nova divisão com os novos splits
    const calculatedInstallments = calculatePurchaseSplitsAndInstallments({
      totalAmount: Number(existing.totalAmount),
      totalInstallments: existing.totalInstallments,
      installmentDates,
      splits: splitsChanged ? validated.splits : undefined,
    });

    const existingInstallmentsMap = new Map(
      existing.installments.map((inst) => [inst.installmentNumber, inst]),
    );

    // Montar parcelas atualizadas aplicando a regra de abono
    const updatedInstallments = calculatedInstallments.map((calcInst) => {
      const existingInst = existingInstallmentsMap.get(calcInst.installmentNumber);

      // Regra de Abono: se a parcela já tem algum pagamento registrado (isPaid: true)
      const hasPaidSplit = existingInst && existingInst.splits.some((s) => s.isPaid);

      if (hasPaidSplit && existingInst) {
        // Preserva integralmente os splits já quitados com status pago histórico
        return {
          id: existingInst.id,
          installmentNumber: calcInst.installmentNumber,
          amount: String(calcInst.amount),
          dueDate: calcInst.dueDate,
          billingMonth: calcInst.billingMonth,
          billingYear: calcInst.billingYear,
          splits: existingInst.splits.map((s) => ({
            id: s.id,
            personId: s.personId,
            amount: s.amount,
            percentage: s.percentage != null ? String(s.percentage) : null,
            isPaid: s.isPaid,
            paidAt: s.paidAt,
          })),
        };
      }

      // Parcela em aberto: se splits não foram alterados, mantém os splits existentes;
      // se splits foram alterados, aplica a nova configuração de rateio (com isPaid: false)
      if (!splitsChanged && existingInst) {
        return {
          id: existingInst.id,
          installmentNumber: calcInst.installmentNumber,
          amount: String(calcInst.amount),
          dueDate: calcInst.dueDate,
          billingMonth: calcInst.billingMonth,
          billingYear: calcInst.billingYear,
          splits: existingInst.splits.map((s) => ({
            id: s.id,
            personId: s.personId,
            amount: s.amount,
            percentage: s.percentage != null ? String(s.percentage) : null,
            isPaid: s.isPaid,
            paidAt: s.paidAt,
          })),
        };
      }

      return {
        id: existingInst?.id,
        installmentNumber: calcInst.installmentNumber,
        amount: String(calcInst.amount),
        dueDate: calcInst.dueDate,
        billingMonth: calcInst.billingMonth,
        billingYear: calcInst.billingYear,
        splits: calcInst.splits.map((s) => ({
          personId: s.personId,
          amount: String(s.amount),
          percentage: s.percentage != null ? String(s.percentage) : null,
          isPaid: false,
          paidAt: null,
        })),
      };
    });

    const updated = await this.purchasesRepo.updatePurchase({
      id,
      userId,
      purchase: {
        description: validated.description ?? existing.description,
        purchaseDate: targetPurchaseDate,
      },
      installments: updatedInstallments,
    });

    if (!updated) {
      throw new NotFoundError("Compra não encontrada");
    }

    return updated;
  }

  async listPurchases(
    userId: string,
    filters?: ListPurchasesFilters,
  ): Promise<PurchaseWithRelations[]> {
    const validatedFilters = filters ? listPurchasesQuerySchema.parse(filters) : undefined;
    return await this.purchasesRepo.findByUserId(userId, validatedFilters);
  }

  async getPurchase(id: string, userId: string): Promise<PurchaseWithRelations> {
    const purchase = await this.purchasesRepo.findById(id, userId);
    if (!purchase) {
      throw new NotFoundError("Compra não encontrada");
    }
    return purchase;
  }

  async deletePurchase(id: string, userId: string): Promise<void> {
    const deleted = await this.purchasesRepo.deletePurchase(id, userId);
    if (!deleted) {
      throw new NotFoundError("Compra não encontrada");
    }
  }

  async toggleSplitPaid(
    splitId: string,
    userId: string,
    isPaid: boolean,
  ): Promise<InstallmentSplit> {
    const splitRecord = await this.purchasesRepo.findSplitById(splitId, userId);
    if (!splitRecord) {
      throw new NotFoundError("Parcela de rateio não encontrada");
    }

    const updated = await this.purchasesRepo.toggleSplitPaid(
      splitId,
      isPaid,
      isPaid ? new Date() : null,
    );

    if (!updated) {
      throw new NotFoundError("Falha ao atualizar status da parcela");
    }

    return updated;
  }
}
