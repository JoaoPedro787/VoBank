import {
  CreditCardResponse,
  CreateCreditCardInput,
  UpdateCreditCardInput,
} from "@/server/credit-cards/schemas/credit-cards.schema";

export type CreditCard = CreditCardResponse;
export type CreateCreditCardData = CreateCreditCardInput;
export type UpdateCreditCardData = UpdateCreditCardInput;
