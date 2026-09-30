import { eq, and } from "drizzle-orm";
import { db } from "../../shared/db";
import { creditCards, CreditCard, NewCreditCard } from "../schemas/credit-cards.schema";
import { ICreditCardsRepository } from "./credit-cards.repository.interface";

export class DrizzleCreditCardsRepository implements ICreditCardsRepository {
  async findByUserId(userId: string): Promise<CreditCard[]> {
    return db.select().from(creditCards).where(eq(creditCards.userId, userId));
  }

  async findById(id: string, userId: string): Promise<CreditCard | null> {
    const result = await db
      .select()
      .from(creditCards)
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .limit(1);
    return result[0] || null;
  }

  async create(card: NewCreditCard): Promise<CreditCard> {
    const result = await db.insert(creditCards).values(card).returning();
    return result[0];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<NewCreditCard>,
  ): Promise<CreditCard | null> {
    const result = await db
      .update(creditCards)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(creditCards)
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId)))
      .returning();
    return result.length > 0;
  }
}
