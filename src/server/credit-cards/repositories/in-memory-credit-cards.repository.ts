import { CreditCard, NewCreditCard } from "../schemas/credit-cards.schema";
import { ICreditCardsRepository } from "./credit-cards.repository.interface";

export class InMemoryCreditCardsRepository implements ICreditCardsRepository {
  private cards: CreditCard[] = [];

  async findByUserId(userId: string): Promise<CreditCard[]> {
    return this.cards.filter((c) => c.userId === userId).map((c) => ({ ...c }));
  }

  async findById(id: string, userId: string): Promise<CreditCard | null> {
    const card = this.cards.find((c) => c.id === id && c.userId === userId);
    return card ? { ...card } : null;
  }

  async create(card: NewCreditCard): Promise<CreditCard> {
    const now = new Date();
    const newCard: CreditCard = {
      id:
        card.id ||
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
      userId: card.userId,
      name: card.name,
      flag: card.flag || "Outro",
      color: card.color,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      limit: card.limit !== undefined && card.limit !== null ? String(card.limit) : null,
      createdAt: card.createdAt || now,
      updatedAt: card.updatedAt || now,
    };

    this.cards.push(newCard);
    return { ...newCard };
  }

  async update(
    id: string,
    userId: string,
    data: Partial<NewCreditCard>,
  ): Promise<CreditCard | null> {
    const index = this.cards.findIndex((c) => c.id === id && c.userId === userId);
    if (index === -1) {
      return null;
    }

    const current = this.cards[index];
    const updated: CreditCard = {
      ...current,
      ...data,
      limit:
        data.limit !== undefined
          ? data.limit === null
            ? null
            : String(data.limit)
          : current.limit,
      updatedAt: new Date(),
    };

    this.cards[index] = updated;
    return { ...updated };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const index = this.cards.findIndex((c) => c.id === id && c.userId === userId);
    if (index === -1) {
      return false;
    }

    this.cards.splice(index, 1);
    return true;
  }

  clear(): void {
    this.cards = [];
  }

  getAll(): CreditCard[] {
    return [...this.cards];
  }
}
