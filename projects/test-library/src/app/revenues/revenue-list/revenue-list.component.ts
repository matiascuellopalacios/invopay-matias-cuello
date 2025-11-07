import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';
import { RevenueService } from '../services/revenue/revenue.service';
import { Subscription } from 'rxjs';
import { Revenue } from '../models/Revenue';
import { CardConfig } from '../../shared/models/movile-table';

@Component({
  selector: 'app-revenue-list',
  templateUrl: './revenue-list.component.html',
  styleUrls: ['./revenue-list.component.scss']
})
export class RevenueListComponent implements OnInit,OnDestroy,AfterViewChecked,AfterViewInit{

  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly amountPipe = inject(AmountFormatPipe);
  private readonly currencyPipe = inject(CurrencySymbolPipe);
  private readonly router = inject(Router);
  private readonly datePipe=inject(CustomDatePipe);
  private readonly revenueService=inject(RevenueService);
  navigatingToDetail = false;
  subscription=new Subscription();
  
  ngOnInit(): void {
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
    this.loadRevenues();  
  }
  
  private initializeMobileCardConfig(): void {
    this.mobileCardConfig = {
      headerKey: 'paymentDate',
      fields: [
        { label: this.translate.instant('IP.REVENUE_LIST.TABLE.CURRENCY'), key: 'currency' },
        { label: this.translate.instant('IP.REVENUE_LIST.TABLE.AMOUNT'), key: 'amount', highlight: true, isAmount: true },
        { label: this.translate.instant('IP.REVENUE_LIST.TABLE.POLICY_NUMBER'), key: 'policyNumber' },
        { label: this.translate.instant('IP.REVENUE_LIST.TABLE.PRODUCT_NAME'), key: 'product' },
        { label: this.translate.instant('IP.REVENUE_LIST.TABLE.BROKER_NAME'), key: 'broker' },
        { label: this.translate.instant('IP.REVENUE_LIST.TABLE.PAYMENT_CHANNEL'), key: 'paymentChannel' }
      ],
      showActionButton: true,
      actionIcon: 'eye'
    };
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (!this.navigatingToDetail) {
      this.revenueService.clearState();
    }
  }
  ngAfterViewChecked(): void {
  }
  
  ngAfterViewInit(): void {
  }
  data: any[] = [];
  originalData: any[] = [];

  titlesFile = new Map<string, string>();
  tableStyle = 'invopay';
  currentPages: number = 1;
  itemsPerPage: number = 50;
  paginatedData: any[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;
  showFiltersModal = false;
  showMobileFiltersModal = false;
  selectedPaymentChannel: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  maxDate: string = '';
  minDateTo: string = '';
  paginatorKey: number = 0;
  isLoading: boolean = false;
  mobileCardConfig!: CardConfig;
  hasSearched: boolean = false;

  get isSearchDisabled(): boolean {
    return (!this.dateFrom || !this.dateTo) && !this.selectedPaymentChannel;
  }

  columns = [
    'paymentDate',
    'currency',
    'amount',
    'provider',
    'paymentChannel',
    'consolidated',
    'policyNumber',
    'product',
    'premiumAmount',
    'broker'
  ];
  
  actions = ['detail'];

  /*
  *Translations
  */
   private initializeTranslations() {
    this.titlesFile = new Map<string, string>([
      ['paymentDate', this.translate.instant('IP.REVENUE_LIST.TABLE.REVENUE_DATE')],
      ['currency', this.translate.instant('IP.REVENUE_LIST.TABLE.CURRENCY')],
      ['amount', this.translate.instant('IP.REVENUE_LIST.TABLE.AMOUNT')],
      ['provider', this.translate.instant('IP.REVENUE_LIST.TABLE.PROVIDEER')],
      ['paymentChannel', this.translate.instant('IP.REVENUE_LIST.TABLE.PAYMENT_CHANNEL')],
      ['consolidated', this.translate.instant('IP.REVENUE_LIST.TABLE.CONSOLIDATED')],
      ['policyNumber', this.translate.instant('IP.REVENUE_LIST.TABLE.POLICY_NUMBER')],
      ['product', this.translate.instant('IP.REVENUE_LIST.TABLE.PRODUCT_NAME')],
      ['premiumAmount', this.translate.instant('IP.REVENUE_LIST.TABLE.PAYMENT_AMOUNT')],
      ['broker', this.translate.instant('IP.REVENUE_LIST.TABLE.BROKER_NAME')]
    ]);
    this.cdr.detectChanges();
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
   * Load revenues
   */
 loadRevenues(){
  const sub=this.revenueService.getAllRevenue().subscribe({
    next:(res)=>{
      const salesData = Array.isArray(res) ? res[0] : res;
                this.originalData = salesData.content.map((revenue:Revenue) => {
                  const symbol = this.currencyPipe.transform(revenue.currency);
                  const revenueDate = new Date(revenue.revenueDate);
                  const fechaHoraFormateada = this.formatDateTimeManual(revenueDate);
                  return {
                    id: revenue.id,
                    paymentDate:fechaHoraFormateada,
                    currency: revenue.currency,
                    amount: this.amountPipe.transform(revenue.revenueAmount, true, symbol, revenue.currency),
                    provider: revenue.paymentProvider,
                    paymentChannel:revenue.paymentChannel,
                    consolidated: revenue.isConsolidated ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
                    policyNumber: revenue.isConsolidated ? revenue.policyNumber : '-',
                    product: revenue.isConsolidated ? revenue.productName : '-',
                    premiumAmount: revenue.isConsolidated 
                    ? this.amountPipe.transform(revenue.premiumAmount, true, symbol, revenue.currency) 
                    : '-',
                    broker: revenue.isConsolidated ? revenue.brokerName : '-',
                    _rawData: revenue
                  };
                });
                
                this.data = [...this.originalData];
                console.log(this.data);
                this.loadData();
                if (this.revenueService.hasState()) {
                    this.restoreState();
                } else {
                this.applyCurrentMonthFilter();
                }
                this.isLoading = false;
    },
    error:(err)=>{
      console.error('Error fetching revenues:', err);
    }
    });
    this.subscription.add(sub);
  }
  /**
   * saveCurrentState
   * ----------------
   * Saves the current state of filters and pagination in the service
   */
  private saveCurrentState(): void {
    this.revenueService.saveState({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      selectedChanelPayment: this.selectedPaymentChannel,
      currentPage: this.currentPages,
      itemsPerPage: this.itemsPerPage,
      filteredData: this.data
    });
  }

  /**
   * restoreState
   * ------------
   * Restores the saved state of filters and pagination
   */
  private restoreState(): void {
    const state = this.revenueService.getState();
    if (state) {
      this.dateFrom = state.dateFrom;
      this.dateTo = state.dateTo;
      this.selectedPaymentChannel = state.selectedChanelPayment;
      this.currentPages = state.currentPage;
      this.itemsPerPage = state.itemsPerPage;
      this.data = state.filteredData;
      
      if (this.dateFrom) {
        this.minDateTo = this.dateFrom;
      }
      
      this.loadData();
    }
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
        aValue = this.parseDateTimeFromString(aValue);
        bValue = this.parseDateTimeFromString(bValue);
      }
      
      if (key === 'amount' || key === 'premiumAmount') {
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
  
  private parseDateTimeFromString(dateString: string): Date {
    const [datePart] = dateString.split(' - ');
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
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

  
  onViewDetail(row: any): void {
    this.navigatingToDetail = true;
    this.saveCurrentState();
    localStorage.setItem('idRevenue', JSON.stringify(row.id));
    this.router.navigate(['/invopay/revenue-detail']);
  }
  /**
   * applyCurrentMonthFilter
   * -----------------------
   * Filters data for the current month without modifying the inputs.
   */
  private applyCurrentMonthFilter(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
  
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    let filteredData = this.originalData.filter(item => {
      const itemDate = new Date(item._rawData.revenueDate);
    return itemDate >= firstDay && itemDate <= lastDay;
    });
    
    this.data = filteredData;
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
  }

/**
   * onClearFilters
   * --------------
   * Clears all filters and displays the current month's data again
   */
  onClearFilters(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedPaymentChannel = '';
    this.minDateTo = '';
    this.hasSearched = false;
    
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
    if (!this.dateFrom && !this.dateTo && !this.selectedPaymentChannel) {
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
    const dateFromDate = this.datePipe.convertToDate(this.dateFrom) as Date;
    dateFromDate.setHours(0, 0, 0, 0);
    
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item._rawData.revenueDate);
      return itemDate >= dateFromDate;
    });
  }
  
  if (this.dateTo) {
    const dateToDate = this.datePipe.convertToDate(this.dateTo) as Date;
    dateToDate.setHours(23, 59, 59, 999);
    
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item._rawData.revenueDate);
      return itemDate <= dateToDate;
    });
  }
    
    if (this.selectedPaymentChannel) {

      filteredData = filteredData.filter(item =>
        this.normalizeString(item._rawData.paymentChannel).includes(this.normalizeString(this.getPaymentChannel(this.selectedPaymentChannel)))
      );
    }
    
    this.data = filteredData;
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
    this.hasSearched = true;
  }

  private getPaymentChannel(productValue: string): string {
    const productMap: {[key: string]: string} = {
      'BOLETO': 'BOLETO',
      'TARJETA': 'TARJETA',
      'CHEQUE': 'CHEQUE',
      'TRANSFERENCIA': 'TRANSFERENCIA'
    };
    return productMap[productValue] || '';
  }

  private normalizeString(str: string): string {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
  }
  /**
   * validateDateRange
   * -----------------
   * Validates that the date range is not greater than 3 months
   */
  private validateDateRange(dateFrom: string, dateTo: string): boolean {
    const from = this.datePipe.convertToDate(dateFrom) as Date;
    const to = this.datePipe.convertToDate(dateTo) as Date;
  
    const monthsDiff = (to.getFullYear() - from.getFullYear()) * 12 + 
                     (to.getMonth() - from.getMonth());
  
    return monthsDiff <= 3 && to >= from;
  }
  /**
 * formatDateTimeManual
 * --------------------
 * Manually formats a date to preserve the time
 * Format: dd/MM/yyyy - H:mm:ss
 */
private formatDateTimeManual(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}
}
