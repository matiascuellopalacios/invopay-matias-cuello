export interface SellsListState  {
  currentPage: number;
  itemsPerPage: number;
  dateFrom: string;
  dateTo: string;
  selectedProduct: string;
  selectedBroker: string;
  filteredData: any[];
}
export interface RevenueListState  {
  currentPage: number;
  itemsPerPage: number;
  dateFrom: string;
  dateTo: string;
  selectedChanelPayment: string;
  filteredData: any[];
}