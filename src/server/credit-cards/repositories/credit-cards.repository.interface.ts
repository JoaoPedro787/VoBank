import { CreditCard, NewCreditCard } from "../schemas/credit-cards.schema";

export interface ICreditCardsRepository {
  findByUserId(userId: string): Promise<CreditCard[]>;
  findById(id: string, userId: string): Promise<CreditCard | null>;
  create(card: NewCreditCard): Promise<CreditCard>;
  update(id: string, userId: string, data: Partial<NewCreditCard>): Promise<CreditCard | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
