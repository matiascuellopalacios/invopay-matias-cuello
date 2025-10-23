import { Component, OnInit, ChangeDetectorRef, AfterViewInit, AfterViewChecked, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SellService } from '../../services/sell/sell.service';
import { Subscription } from 'rxjs';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { Router } from '@angular/router';
import { Sale } from '../../interface/Sales';
import { SellsListState } from '../../interface/saleFilters';
import { CardConfig } from '../../interface/movile-table';

@Component({
  selector: 'app-sells-list',
  templateUrl: './sells-list.component.html',
  styleUrls: ['./sells-list.component.scss']
})
export class SellsListComponent implements OnInit,OnDestroy,AfterViewInit,AfterViewChecked {
  data: any[] = [];
  originalData: any[] = [];
  
  private readonly saleServices = inject(SellService); 
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly amountPipe = inject(AmountFormatPipe);
  private readonly currencyPipe = inject(CurrencySymbolPipe);
  private readonly router = inject(Router);
  private navigatingToDetail = false;
  subscription = new Subscription();
  
  columns = [
    'paymentDate',
    'productName',
    'broker',
    'client',
    'policyAmount',
    'premiumAmount'
  ];
  
  actions = ['detail'];
  
  titlesFile = new Map<string, string>();
  tableStyle = 'invopay';
  currentPages: number = 1;
  itemsPerPage: number = 25;
  paginatedData: any[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;
  
  showFiltersModal = false;
  showMobileFiltersModal = false;
  selectedProduct: string = '';
  selectedBroker: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  
  maxDate: string = '';
  minDateTo: string = '';
  
  paginatorKey: number = 0;
  isLoading: boolean = false;
  
  mobileCardConfig!: CardConfig;

  get isSearchDisabled(): boolean {
    return !this.dateFrom && !this.dateTo && !this.selectedProduct && !this.selectedBroker;
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  ngAfterViewChecked(): void {
  }
  
  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.setMaxDate();
    this.initializeMobileCardConfig();
    
    this.translate.get('IP.SELLS_LIST.TABLE.SALE_DATE').subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    
    this.loadSalesFromBackend();
  }
  
  private initializeMobileCardConfig(): void {
    this.mobileCardConfig = {
      headerKey: 'paymentDate',
      fields: [
        { label: this.translate.instant('IP.SELLS_LIST.TABLE.PRODUCT_NAME'), key: 'productName' },
        { label: this.translate.instant('IP.SELLS_LIST.TABLE.BROKER_NAME'), key: 'broker' },
        { label: this.translate.instant('IP.SELLS_LIST.TABLE.CLIENT_NAME'), key: 'client' },
        { label: this.translate.instant('IP.SELLS_LIST.TABLE.POLICY_AMOUNT'), key: 'policyAmount', highlight: true, isAmount: true },
        { label: this.translate.instant('IP.SELLS_LIST.TABLE.PREMIUM_AMOUNT'), key: 'premiumAmount' }
      ],
      showActionButton: true,
      actionIcon: 'eye'
    };
  }
  
  /**
   * setMaxDate
   * ----------
   * Sets the maximum date as today
   */
  private setMaxDate(): void {
    const today = new Date();
    this.maxDate = this.formatDateToYYYYMMDD(today);
  }
  
  /**
   * formatDateToYYYYMMDD
   * --------------------
   * Converts a date to YYYY-MM-DD format for date type inputs
   */
  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * loadSalesFromBackend
   * --------------------
   * Loads data from the backend and maps it to the component structure.
   */
  private loadSalesFromBackend(): void {
    this.isLoading = true;
    
    this.subscription.add(
      this.saleServices.getSales().subscribe({
        next: (response: any) => {
          const salesData = Array.isArray(response) ? response[0] : response;
          this.originalData = salesData.content.map((sale: Sale) => {
            const symbol = this.currencyPipe.transform(sale.currency);
            
            return {
              id: sale.id,
              paymentDate: this.formatDateToDDMMYYYY(sale.saleDate),
              productName: sale.productName,
              broker: sale.brokerName,
              client: sale.customerName,
              policyAmount: this.amountPipe.transform(sale.policyAmount, true, symbol, sale.currency),
              premiumAmount: this.amountPipe.transform(sale.premiumAmount, true, symbol, sale.currency),
              _rawData: sale
            };
          });
          
          this.data = [...this.originalData];
          if (this.saleServices.hasState()) {
            this.restoreState();
          } else {
            this.applyCurrentMonthFilter();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading sales:', error);
          this.isLoading = false;
          this.data = [];
          this.originalData = [];
          this.totalItems = 0;
          this.updatePaginatedData();
        }
      })
    );
  }
  
  /**
   * formatDateToDDMMYYYY
   * --------------------
   * Converts a date from the backend (ISO string or yyyy-MM-dd format) to DD/MM/YYYY format.
   */
  private formatDateToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
  
  /**
   * applyCurrentMonthFilter
   * -----------------------
   * Filters data for the current month without modifying the inputs.
   */
  private applyCurrentMonthFilter(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    let filteredData = this.originalData.filter(item => {
      const itemDate = this.parseDateFromString(item.paymentDate);
      return itemDate >= firstDay && itemDate <= lastDay;
    });
    
    this.data = filteredData;
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
  }
  
  private initializeTranslations() {
    this.titlesFile = new Map<string, string>([
      ['paymentDate', this.translate.instant('IP.SELLS_LIST.TABLE.SALE_DATE')],
      ['productName', this.translate.instant('IP.SELLS_LIST.TABLE.PRODUCT_NAME')],
      ['broker', this.translate.instant('IP.SELLS_LIST.TABLE.BROKER_NAME')],
      ['client', this.translate.instant('IP.SELLS_LIST.TABLE.CLIENT_NAME')],
      ['policyAmount', this.translate.instant('IP.SELLS_LIST.TABLE.POLICY_AMOUNT')],
      ['premiumAmount', this.translate.instant('IP.SELLS_LIST.TABLE.PREMIUM_AMOUNT')],
    ]);
    this.cdr.detectChanges();
  }
  
  /**
   * restoreState
   * ------------
   * Restores filters and pagination from the service
   */
  private restoreState(): void {
    const state = this.saleServices.getState();
    if (!state) return;

    this.dateFrom = state.dateFrom;
    this.dateTo = state.dateTo;
    this.selectedProduct = state.selectedProduct;
    this.selectedBroker = state.selectedBroker;
    
    if (this.dateFrom) {
      this.minDateTo = this.dateFrom;
    }
    
    this.data = state.filteredData;
    this.totalItems = this.data.length;
    
    this.currentPages = state.currentPage;
    this.itemsPerPage = state.itemsPerPage;
    
    this.updatePaginatedData();
    
    this.saleServices.clearState();
  }

  /**
   * saveCurrentState
   * ----------------
   * Saves the current state of filters and pagination
   */
  private saveCurrentState(): void {
    const state: SellsListState = {
      currentPage: this.currentPages,
      itemsPerPage: this.itemsPerPage,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      selectedProduct: this.selectedProduct,
      selectedBroker: this.selectedBroker,
      filteredData: [...this.data]
    };
    
    this.saleServices.saveState(state);
  }
  
  /**
   * Pagination
   */
  onPageChange(page: number) {
    this.currentPages = page;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    this.itemsPerPage = +this.itemsPerPage;
    const start = (this.currentPages - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.data.slice(start, end);
  }
  
  loadData(): void {
    this.totalItems = this.data.length;
    this.updatePaginatedData();
  }

  onTableAction(event: any): void {
    const { event: action, dataField } = event;
    if (action === 'detail') {
      this.onViewDetail(dataField);
    }
  }
  
  onMobileCardAction(item: any): void {
    this.onViewDetail(item);
  }
  
  onTableSort(event: any): void {
    const { event: sortDirection, key } = event;
    
    if (sortDirection === 'clean') {
      this.data = [...this.data];
      this.updatePaginatedData();
      return;
    }
    
    this.data.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      
      if (key === 'paymentDate') {
        aValue = this.parseDateFromString(aValue);
        bValue = this.parseDateFromString(bValue);
      }
      if (key === 'policyAmount' || key === 'premiumAmount') {
        aValue = this.parseAmount(aValue);
        bValue = this.parseAmount(bValue);
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.updatePaginatedData();
  }
  
  private parseAmount(amountString: string): number {
     const cleaned = amountString.replace(/[^0-9,-]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }
  
  onItemsPerPageChange(newValue: number): void {
    this.itemsPerPage = Number(newValue);
    this.currentPages = 1;
    this.paginatorKey++;
    this.showPaginator = false;
    setTimeout(() => {
      this.showPaginator = true;
      this.cdr.detectChanges();
    }, 0);
    this.updatePaginatedData();
  }

  /**
   * onDateFromChange
   * ----------------
   * Handles the change in the "from" date and updates the minimum date for "to"
   */
  onDateFromChange(event: any): void {
    this.dateFrom = event.target.value;
    
    if (this.dateFrom) {
      this.minDateTo = this.dateFrom;
      
      if (this.dateTo && this.dateTo < this.dateFrom) {
        this.dateTo = '';
      }
    } else {
      this.minDateTo = '';
    }
  }
  
  /**
   * onDateToChange
   * --------------
   * Handles the change in the "to" date
   */
  onDateToChange(event: any): void {
    this.dateTo = event.target.value;
  }
  
  /**
   * onSearch
   * --------
   * Applies filters independently (date, product, broker).
   * Filters can be used alone or combined.
   */
  onSearch(): void {
    if (!this.dateFrom && !this.dateTo && !this.selectedProduct && !this.selectedBroker) {
      this.applyCurrentMonthFilter();
      return;
    }
    
    if (this.dateFrom && this.dateTo) {
      if (!this.validateDateRange(this.dateFrom, this.dateTo)) {
        alert('El rango de fechas no puede ser mayor a 3 meses');
        return;
      }
    }
    
    let filteredData = [...this.originalData];
    
    if (this.dateFrom) {
      const dateFromDate = this.parseDate(this.dateFrom);
      filteredData = filteredData.filter(item => {
        const itemDate = this.parseDateFromString(item.paymentDate);
        return itemDate >= dateFromDate;
      });
    }
    
    if (this.dateTo) {
      const dateToDate = this.parseDate(this.dateTo);
      filteredData = filteredData.filter(item => {
        const itemDate = this.parseDateFromString(item.paymentDate);
        return itemDate <= dateToDate;
      });
    }
    
    if (this.selectedProduct) {
      filteredData = filteredData.filter(item => 
        this.normalizeString(item.productName).includes(this.normalizeString(this.getProductName(this.selectedProduct)))
      );
    }
    
    if (this.selectedBroker) {
      filteredData = filteredData.filter(item => 
        this.normalizeString(item.broker).includes(this.normalizeString(this.getBrokerName(this.selectedBroker)))
      );
    }
    
    this.data = filteredData;
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
  }
  
  /**
   * validateDateRange
   * -----------------
   * Validates that the date range is not greater than 3 months
   */
  private validateDateRange(dateFrom: string, dateTo: string): boolean {
    const from = this.parseDate(dateFrom);
    const to = this.parseDate(dateTo);
    
    const monthsDiff = (to.getFullYear() - from.getFullYear()) * 12 + 
                       (to.getMonth() - from.getMonth());
    
    return monthsDiff <= 3 && to >= from;
  }
  
  /**
   * onClearFilters
   * --------------
   * Clears all filters and displays the current month's data again
   */
  onClearFilters(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedProduct = '';
    this.selectedBroker = '';
    this.minDateTo = '';
    
    this.applyCurrentMonthFilter();
  }
  
  openFilters(): void {
    this.showFiltersModal = true;
  }
  
  closeFilters(): void {
    this.showFiltersModal = false;
  }
  
  applyModalFilters(): void {
    this.onSearch();
    this.closeFilters();
  }

  openMobileFilters(): void {
    this.showMobileFiltersModal = true;
  }
  
  closeMobileFilters(): void {
    this.showMobileFiltersModal = false;
  }
  
  /**
   * parseDate
   * ---------
   * Converts a string in YYYY-MM-DD format to a Date object
   */
  private parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  /**
   * parseDateFromString
   * -------------------
   * Converts a string in DD/MM/YYYY format to a Date object
   */
  private parseDateFromString(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }
  
  private normalizeString(str: string): string {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
  }
  
  private getProductName(productValue: string): string {
    const productMap: {[key: string]: string} = {
      'Seguro de Vida Total': 'Seguro de Vida Total',
      'Seguro de Hogar Premium': 'Seguro de Hogar Premium',
      'Seguro Automotor Plus': 'Seguro Automotor Plus',
      'Seguro de Accidentes Personales': 'Seguro de Accidentes Personales'
    };
    return productMap[productValue] || '';
  }
  
  private getBrokerName(brokerValue: string): string {
    const brokerMap: {[key: string]: string} = {
      'juan-perez': 'Juan Perez',
      'Sofía Gómez': 'Sofía Gómez',
      'María Rodríguez': 'María Rodríguez'
    };
    return brokerMap[brokerValue] || '';
  }
  
  
  onViewDetail(row: any): void {
    console.log('View detail of:', row.id);
    this.navigatingToDetail = true;
    this.saveCurrentState();
    localStorage.setItem('idSale', JSON.stringify(row.id));
    this.router.navigate(['/invopay/sale-detail']);
  }
}
