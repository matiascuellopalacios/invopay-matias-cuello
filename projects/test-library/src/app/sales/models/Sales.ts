export interface Sale {
  id: number;
  amount: number;
  saleDate: string;
  currency: string;
  customerId: string;
  customerName: string;
  brokerId: number;
  brokerName: string;
  brokerNameBussiness: string;
  productId: string;
  productName: string;
  policyAmount: number;
  policyNumber: string;
  premiumPaymentInstallments: number;
  premiumAmount: number;
}


export interface Sort {
  unsorted: boolean;
  sorted: boolean;
  empty: boolean;
}


export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}


export interface SalesResponse {
  content: Sale[];
  pageable: Pageable;
  totalPages: number;
  last: boolean;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}

export interface SalesFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  producto?: string;
  broker?: string;
  page?: number;
  size?: number;
}

export interface PaginationOptions {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}