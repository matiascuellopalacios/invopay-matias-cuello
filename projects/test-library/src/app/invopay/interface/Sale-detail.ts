
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
  fechaVenta: string;
  nombreProducto: string;
  broker: string;
  cliente: string;
  montoPoliza: string;
  montoPrima: string;
  detalle: string;
  _rawData: SaleDetail; 
}


export interface SaleDetail {
  fechaVenta: string;
  numeroPoliza: string;
  nombreProducto: string;
  montoPoliza: string;
  montoPrima: string;
  comisionValor: string;
  comisionBroker: string;
  frecuenciaPago: string;
  cliente: string;
  email: string;
  telefono: string;
}

export interface PaymentPlanItem {
  numeroCuota: number;
  valorCuota: string;
  fechaVencimiento: string;
  estadoPago: string;
  fechaPago: string;
  comisionPagada: string;
  valorComision: string;
}

export interface SellsListState {
  currentPage: number;
  itemsPerPage: number;
  fechaDesde: string;
  fechaHasta: string;
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