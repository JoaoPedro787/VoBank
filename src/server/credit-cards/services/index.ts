import { CreditCardsService } from "./credit-cards.service";
import { DrizzleCreditCardsRepository } from "../repositories/drizzle-credit-cards.repository";

let creditCardsServiceInstance: CreditCardsService | null = null;

export function getCreditCardsService(): CreditCardsService {
  if (!creditCardsServiceInstance) {
    creditCardsServiceInstance = new CreditCardsService(new DrizzleCreditCardsRepository());
  }
  return creditCardsServiceInstance;
}

export function setCreditCardsService(service: CreditCardsService | null): void {
  creditCardsServiceInstance = service;
}

export * from "./credit-cards.service";
export { InMemoryCreditCardsRepository } from "../repositories/in-memory-credit-cards.repository";
