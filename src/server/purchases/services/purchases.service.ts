import {
  CreatePurchaseInput,
  createPurchaseSchema,
  InstallmentSplit,
} from "../schemas/purchases.schema";
import {
  IPurchasesRepository,
  PurchaseWithRelations,
} from "../repositories/purchases.repository.interface";
import { ICreditCardsRepository } from "../../credit-cards/repositories/credit-cards.repository.interface";
import { IPeopleRepository } from "../../people/repositories/people.repository.interface";
import { NotFoundError, BadRequestError } from "../../shared/errors/app-error";
import { calculateInstallmentDates } from "../../../shared/utils/invoice-cycle";
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

  async listPurchases(userId: string): Promise<PurchaseWithRelations[]> {
    return await this.purchasesRepo.findByUserId(userId);
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
