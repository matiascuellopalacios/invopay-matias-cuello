export interface SellsListState  {
  currentPage: number;
  itemsPerPage: number;
  fechaDesde: string;
  fechaHasta: string;
  selectedProduct: string;
  selectedBroker: string;
  filteredData: any[];
}
export interface RevenueListState  {
  currentPage: number;
  itemsPerPage: number;
  fechaDesde: string;
  fechaHasta: string;
  selectedChanelPayment: string;
  filteredData: any[];
}