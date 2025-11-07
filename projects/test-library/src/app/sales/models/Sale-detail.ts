
export interface Customer {
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  fullName: string;
}

export interface PremiumInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  paymentDate?: string;
}


export interface PolicyData {
  number: string;
  amount: number;
  saleDate: string | null;
  productName: string | null;
  premiumAmount: number;
  premiumPaymentInstallments: number | null;
  premiumPaymentPlan: PremiumInstallment[];
}


export interface SaleDetail {
  id: number;
  amount: number;
  saleDate: string;
  currency: string;
  customer: Customer;
  brokerId: number;
  brokerName: string;
  brokerNameBussiness: string;
  productId: string;
  productName: string;
  premiumPaymentInstallments: number;
  policyData: PolicyData;
}


export interface SaleListItem {
  id: number;
  saleDate: string;
  productName: string;
  broker: string;
  client: string;
  policyAmount: string;
  premiumAmount: string;
  detail: string;
  _rawData: SaleDetail; 
}


export interface SaleDetailView {
  saleDate: string;
  policyNumber: string;
  productName: string;
  policyAmount: string;
  premiumAmount: string;
  commissionValue: string;
  brokerCommission: string;
  paymentFrequency: string;
  client: string;
  email: string;
  phone: string;
}

export interface PaymentPlanItem {
  installmentNumber: number;
  installmentValue: string;
  dueDate: string;
  paymentStatus: string;
  paymentDate: string;
  paidCommission: string;
  commissionValue: string;
}

export interface SellsListStateOld {
  currentPage: number;
  itemsPerPage: number;
  dateFrom: string;
  dateTo: string;
  selectedProduct: string;
  selectedBroker: string;
  filteredData: SaleListItem[];
}


export interface FilterOptions {
  products: FilterOption[];
  brokers: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
}