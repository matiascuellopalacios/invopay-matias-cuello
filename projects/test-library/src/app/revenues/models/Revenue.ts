export interface RevenueResponse {
  content: Revenue[];
  pageable: Pageable;
  totalPages: number;
  last: boolean;
  totalElements: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: Sort;
  empty: boolean;
}

export interface Revenue {
  id: number;
  revenueDate: string;
  currency: string;
  revenueAmount: number;
  paymentProvider: string;
  paymentChannel: string;
  isConsolidated: boolean;
  policyNumber: string;
  productName: string;
  premiumAmount: number;
  brokerName: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface Sort {
  unsorted: boolean;
  empty: boolean;
  sorted: boolean;
}