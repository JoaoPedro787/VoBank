import {
  Purchase,
  NewPurchase,
  Installment,
  NewInstallment,
  InstallmentSplit,
  NewInstallmentSplit,
  ListPurchasesFilters,
} from "../schemas/purchases.schema";

export type { ListPurchasesFilters };

export type InstallmentSplitWithPerson = InstallmentSplit & {
  person?: { id: string; name: string; color: string } | null;
};

export type InstallmentWithSplits = Installment & {
  splits: InstallmentSplitWithPerson[];
};

export type PurchaseWithRelations = Purchase & {
  creditCard?: {
    id: string;
    name: string;
    flag: string;
    color: string;
    closingDay: number;
    dueDay: number;
  } | null;
  installments: InstallmentWithSplits[];
};

export interface CreatePurchaseParams {
  purchase: NewPurchase;
  installments: Array<{
    installment: Omit<NewInstallment, "purchaseId">;
    splits: Array<Omit<NewInstallmentSplit, "installmentId">>;
  }>;
}

export interface UpdatePurchaseParams {
  id: string;
  userId: string;
  purchase: {
    description?: string;
    purchaseDate?: Date;
  };
  installments?: Array<{
    id?: string;
    installmentNumber: number;
    amount: string;
    dueDate: Date;
    billingMonth: number;
    billingYear: number;
    splits: Array<{
      id?: string;
      personId: string | null;
      amount: string;
      percentage: string | null;
      isPaid: boolean;
      paidAt?: Date | null;
    }>;
  }>;
}

export interface IPurchasesRepository {
  createPurchaseWithInstallments(params: CreatePurchaseParams): Promise<PurchaseWithRelations>;
  updatePurchase(params: UpdatePurchaseParams): Promise<PurchaseWithRelations | null>;
  findByUserId(userId: string, filters?: ListPurchasesFilters): Promise<PurchaseWithRelations[]>;
  findById(id: string, userId: string): Promise<PurchaseWithRelations | null>;
  findSplitById(
    splitId: string,
    userId: string,
  ): Promise<{
    split: InstallmentSplit;
    installment: Installment;
    purchase: Purchase;
  } | null>;
  toggleSplitPaid(
    splitId: string,
    isPaid: boolean,
    paidAt?: Date | null,
  ): Promise<InstallmentSplit | null>;
  deletePurchase(id: string, userId: string): Promise<boolean>;
}
