import { ICreditCardsRepository } from "../repositories/credit-cards.repository.interface";
import {
  CreateCreditCardInput,
  UpdateCreditCardInput,
  CreditCardResponse,
  NewCreditCard,
  createCreditCardSchema,
  updateCreditCardSchema,
} from "../schemas/credit-cards.schema";
import { NotFoundError } from "../../shared/errors/app-error";

export class CreditCardsService {
  constructor(private cardsRepo: ICreditCardsRepository) {}

  async listCards(userId: string): Promise<CreditCardResponse[]> {
    const cards = await this.cardsRepo.findByUserId(userId);
    return cards.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      flag: c.flag,
      color: c.color,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      limit: c.limit,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async getCard(id: string, userId: string): Promise<CreditCardResponse> {
    const card = await this.cardsRepo.findById(id, userId);
    if (!card) {
      throw new NotFoundError("Cartão não encontrado");
    }

    return {
      id: card.id,
      userId: card.userId,
      name: card.name,
      flag: card.flag,
      color: card.color,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      limit: card.limit,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    };
  }

  async createCard(userId: string, input: CreateCreditCardInput): Promise<CreditCardResponse> {
    const validated = createCreditCardSchema.parse(input);

    const created = await this.cardsRepo.create({
      userId,
      name: validated.name,
      flag: validated.flag,
      color: validated.color,
      closingDay: validated.closingDay,
      dueDay: validated.dueDay,
      limit: validated.limit != null ? String(validated.limit) : null,
    });

    return {
      id: created.id,
      userId: created.userId,
      name: created.name,
      flag: created.flag,
      color: created.color,
      closingDay: created.closingDay,
      dueDay: created.dueDay,
      limit: created.limit,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateCard(
    id: string,
    userId: string,
    input: UpdateCreditCardInput,
  ): Promise<CreditCardResponse> {
    const validated = updateCreditCardSchema.parse(input);

    const updateData: Partial<NewCreditCard> = {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.flag !== undefined && { flag: validated.flag }),
      ...(validated.color !== undefined && { color: validated.color }),
      ...(validated.closingDay !== undefined && { closingDay: validated.closingDay }),
      ...(validated.dueDay !== undefined && { dueDay: validated.dueDay }),
      ...(validated.limit !== undefined && {
        limit: validated.limit !== null ? String(validated.limit) : null,
      }),
    };

    const updated = await this.cardsRepo.update(id, userId, updateData);
    if (!updated) {
      throw new NotFoundError("Cartão não encontrado");
    }

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.name,
      flag: updated.flag,
      color: updated.color,
      closingDay: updated.closingDay,
      dueDay: updated.dueDay,
      limit: updated.limit,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteCard(id: string, userId: string): Promise<void> {
    const deleted = await this.cardsRepo.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Cartão não encontrado");
    }
  }
}
