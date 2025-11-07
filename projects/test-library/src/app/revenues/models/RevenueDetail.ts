export interface TransactionData {
  revenueDate: string;
  currency: string;
  amount: number;
  paymentProvider: string;
  paymentChannel: string;
  transactionObservations: string;
}

export interface ConciliationData {
  isConsolidated: boolean;
  productName: string;
  policyNumber: string;
  policyAmount: number;
  paymentNumber: number;
  paymentValue: number;
  brokerName: string;
}

export interface PaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  isPaid: boolean | null;
}

export interface PolicyData {
  number: string;
  amount: number;
  saleDate: string;
  productName: string;
  premiumAmount: number;
  premiumPaymentInstallments: number | null;
  premiumPaymentPlan: PaymentInstallment[];
}

export interface ConciliationResponse {
  transactionData: TransactionData;
  conciliationData: ConciliationData;
  policyData: PolicyData;
}
