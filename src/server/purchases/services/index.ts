import { PurchasesService } from "./purchases.service";
import { DrizzlePurchasesRepository } from "../repositories/drizzle-purchases.repository";
import { DrizzleCreditCardsRepository } from "../../credit-cards/repositories/drizzle-credit-cards.repository";
import { DrizzlePeopleRepository } from "../../people/repositories/drizzle-people.repository";

let purchasesServiceInstance: PurchasesService | null = null;

export function getPurchasesService(): PurchasesService {
  if (!purchasesServiceInstance) {
    purchasesServiceInstance = new PurchasesService(
      new DrizzlePurchasesRepository(),
      new DrizzleCreditCardsRepository(),
      new DrizzlePeopleRepository(),
    );
  }
  return purchasesServiceInstance;
}

export function setPurchasesService(service: PurchasesService | null): void {
  purchasesServiceInstance = service;
}

export * from "./purchases.service";
export { InMemoryPurchasesRepository } from "../repositories/in-memory-purchases.repository";
export * from "../repositories/purchases.repository.interface";
