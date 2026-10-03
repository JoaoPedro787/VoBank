export type PaymentMethod = "cash" | "debit" | "credit";

export interface CreateSplitData {
  personId?: string | null;
  amount?: number;
  percentage?: number;
}

export interface CreatePurchaseData {
  description: string;
  totalAmount: number;
  purchaseDate?: string | Date;
  paymentMethod: PaymentMethod;
  creditCardId?: string | null;
  totalInstallments?: number;
  splits?: CreateSplitData[];
}

export interface UpdatePurchaseData {
  description?: string;
  purchaseDate?: string | Date;
  paymentMethod?: PaymentMethod;
  creditCardId?: string | null;
  totalAmount?: number;
  totalInstallments?: number;
  splits?: CreateSplitData[];
}

export interface InstallmentSplitClient {
  id: string;
  installmentId: string;
  personId: string | null;
  amount: string;
  percentage?: string | null;
  isPaid: boolean;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  person?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface InstallmentClient {
  id: string;
  purchaseId: string;
  installmentNumber: number;
  amount: string;
  dueDate: string;
  billingMonth: number;
  billingYear: number;
  createdAt: string;
  updatedAt: string;
  splits: InstallmentSplitClient[];
}

export interface PurchaseClient {
  id: string;
  userId: string;
  creditCardId?: string | null;
  description: string;
  totalAmount: string;
  purchaseDate: string;
  paymentMethod: PaymentMethod;
  totalInstallments: number;
  createdAt: string;
  updatedAt: string;
  creditCard?: {
    id: string;
    name: string;
    flag: string;
    color: string;
    closingDay: number;
    dueDay: number;
  } | null;
  installments: InstallmentClient[];
}
