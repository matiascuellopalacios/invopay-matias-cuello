import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';
import { RevenueService } from '../../services/revenue/revenue.service';
import { Subscription } from 'rxjs';
import { Revenue } from '../../interface/Revenue';
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
    this.translate.get('IP.SELLS_LIST.TABLE.SALE_DATE').subscribe(() => {
      this.initializeTranslations();
    });
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
    });
    this.loadRevenues();  
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (!this.navigatingToDetail) {
      this.revenueService.clearState();
    }
  }
  ngAfterViewChecked(): void {
    this.renderIcons();
  }
  
  ngAfterViewInit(): void {
    this.renderIcons();
    this.setupIconClick();
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
  selectedpaymentChannel: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  maxDate: string = '';
  minDateHasta: string = '';
  paginatorKey: number = 0;
  isLoading: boolean = false;
  columns = [
    'fechaHora',
    'moneda',
    'monto',
    'proveedor',
    'canalPago',
    'consolidada',
    'nroPoliza',
    'producto',
    'montoPrima',
    'broker',
    'detalle'
  ];

  /*
  *Translations
  */
   private initializeTranslations() {
    this.titlesFile = new Map<string, string>([
      ['fechaHora', this.translate.instant('IP.REVENUE_LIST.TABLE.REVENUE_DATE')],
      ['moneda', this.translate.instant('IP.REVENUE_LIST.TABLE.CURRENCY')],
      ['monto', this.translate.instant('IP.REVENUE_LIST.TABLE.AMOUNT')],
      ['proveedor', this.translate.instant('IP.REVENUE_LIST.TABLE.PROVIDEER')],
      ['canalPago', this.translate.instant('IP.REVENUE_LIST.TABLE.PAYMENT_CHANNEL')],
      ['consolidada', this.translate.instant('IP.REVENUE_LIST.TABLE.CONSOLIDATED')],
      ['nroPoliza', this.translate.instant('IP.REVENUE_LIST.TABLE.POLICY_NUMBER')],
      ['producto', this.translate.instant('IP.REVENUE_LIST.TABLE.PRODUCT_NAME')],
      ['montoPrima', this.translate.instant('IP.REVENUE_LIST.TABLE.PAYMENT_AMOUNT')],
      ['broker', this.translate.instant('IP.REVENUE_LIST.TABLE.BROKER_NAME')],
      ['detalle', this.translate.instant('IP.REVENUE_LIST.TABLE.DETAIL')]
    ]);
    this.cdr.detectChanges();
  }

  /**
   * setMaxDate
   * ----------
   * Establece la fecha máxima como el día de hoy
   */
  private setMaxDate(): void {
    const today = new Date();
    this.maxDate = this.formatDateToYYYYMMDD(today);
  }
  /**
   * formatDateToYYYYMMDD
   * --------------------
   * Convierte una fecha a formato YYYY-MM-DD para los inputs de tipo date
   */
  private formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /*
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
                    fechaHora:fechaHoraFormateada,
                    moneda: revenue.currency,
                    monto: this.amountPipe.transform(revenue.revenueAmount, true, symbol, revenue.currency),
                    proveedor: revenue.paymentProvider,
                    canalPago:revenue.paymentChannel,
                    consolidada: revenue.isConsolidated ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
                    nroPoliza: revenue.isConsolidated ? revenue.policyNumber : '-',
                    producto: revenue.isConsolidated ? revenue.productName : '-',
                    montoPrima: revenue.isConsolidated 
                    ? this.amountPipe.transform(revenue.premiumAmount, true, symbol, revenue.currency) 
                    : '-',
                    broker: revenue.isConsolidated ? revenue.brokerName : '-',
                    detalle: 'Ver',
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
   * Guarda el estado actual de filtros y paginación en el servicio
   */
  private saveCurrentState(): void {
    this.revenueService.saveState({
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      selectedChanelPayment: this.selectedpaymentChannel,
      currentPage: this.currentPages,
      itemsPerPage: this.itemsPerPage,
      filteredData: this.data
    });
  }

  /**
   * restoreState
   * ------------
   * Restaura el estado guardado de filtros y paginación
   */
  private restoreState(): void {
    const state = this.revenueService.getState();
    if (state) {
      this.fechaDesde = state.fechaDesde;
      this.fechaHasta = state.fechaHasta;
      this.selectedpaymentChannel = state.selectedChanelPayment;
      this.currentPages = state.currentPage;
      this.itemsPerPage = state.itemsPerPage;
      this.data = state.filteredData;
      
      if (this.fechaDesde) {
        this.minDateHasta = this.fechaDesde;
      }
      
      this.loadData();
    }
  }


  /**
   * Paginación
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

  private renderIcons() {
    const cells = document.querySelectorAll('td'); 
    cells.forEach(cell => {
      if (cell.textContent?.trim() === 'Ver') {
        cell.innerHTML = `
          <button class="btn-eye" title="Ver detalle">
            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'
                 fill='currentColor' class='bi bi-eye-fill'
                 viewBox='0 0 16 16'>
              <path d='M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0'/>
              <path d='M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8
                       m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7'/>
            </svg>
          </button>`;
      }
    });
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

  private setupIconClick() {
    document.addEventListener('click', (event: any) => {
      const btn = event.target.closest('.btn-eye');
      if (btn) {
        const tr = btn.closest('tr');
        if (!tr) return;
        const rows = Array.from(tr.parentNode.children);
        const rowIndex = rows.indexOf(tr);
        const rowData = this.paginatedData[rowIndex];
        if (rowData) this.onViewDetail(rowData);
      }
    });
  }
  
  onViewDetail(row: any): void {
    this.navigatingToDetail = true;
    this.saveCurrentState();
    localStorage.setItem('idRevenue', JSON.stringify(row.id));
    this.router.navigate(['/revenue-detail']);
  }
  /**
   * applyCurrentMonthFilter
   * -----------------------
   * Filtra los datos del mes actual sin modificar los inputs.
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
   * Limpia todos los filtros y vuelve a mostrar los datos del mes actual
   */
  onClearFilters(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.selectedpaymentChannel = '';
    this.minDateHasta = '';
    
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

  /**
   * onFechaDesdeChange
   * ------------------
   * Maneja el cambio en la fecha "desde" y actualiza la fecha mínima para "hasta"
   */
  onFechaDesdeChange(event: any): void {
    this.fechaDesde = event.target.value;
    
    if (this.fechaDesde) {
      this.minDateHasta = this.fechaDesde;
      
      if (this.fechaHasta && this.fechaHasta < this.fechaDesde) {
        this.fechaHasta = '';
      }
    } else {
      this.minDateHasta = '';
    }
  }

  /**
   * onFechaHastaChange
   * ------------------
   * Maneja el cambio en la fecha "hasta"
   */
  onFechaHastaChange(event: any): void {
    this.fechaHasta = event.target.value;
  }

   /**
   * onSearch
   * --------
   * Aplica los filtros de forma independiente (fecha, producto, broker).
   * Los filtros pueden usarse solos o combinados.
   */
  onSearch(): void {
    if (!this.fechaDesde && !this.fechaHasta && !this.selectedpaymentChannel) {
      this.applyCurrentMonthFilter();
      return;
    }
    
    if (this.fechaDesde && this.fechaHasta) {
      if (!this.validateDateRange(this.fechaDesde, this.fechaHasta)) {
        alert('El rango de fechas no puede ser mayor a 3 meses');
        return;
      }
    }
    
    let filteredData = [...this.originalData];
    
      if (this.fechaDesde) {
    const fechaDesdeDate = this.datePipe.convertToDate(this.fechaDesde) as Date;
    fechaDesdeDate.setHours(0, 0, 0, 0);
    
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item._rawData.revenueDate);
      return itemDate >= fechaDesdeDate;
    });
  }
  
  if (this.fechaHasta) {
    const fechaHastaDate = this.datePipe.convertToDate(this.fechaHasta) as Date;
    fechaHastaDate.setHours(23, 59, 59, 999);
    
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item._rawData.revenueDate);
      return itemDate <= fechaHastaDate;
    });
  }
    
    if (this.selectedpaymentChannel) {

      filteredData = filteredData.filter(item =>
        this.normalizeString(item._rawData.paymentChannel).includes(this.normalizeString(this.getPaymentChannel(this.selectedpaymentChannel)))
      );
    }
    
    this.data = filteredData;
    this.totalItems = this.data.length;
    this.currentPages = 1;
    this.updatePaginatedData();
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
   * Valida que el rango de fechas no sea mayor a 3 meses
   */
  private validateDateRange(fechaDesde: string, fechaHasta: string): boolean {
    const desde = this.datePipe.convertToDate(fechaDesde) as Date;
    const hasta = this.datePipe.convertToDate(fechaHasta) as Date;
  
    const monthsDiff = (hasta.getFullYear() - desde.getFullYear()) * 12 + 
                     (hasta.getMonth() - desde.getMonth());
  
    return monthsDiff <= 3 && hasta >= desde;
  }
  /**
 * formatDateTimeManual
 * --------------------
 * Formatea una fecha manualmente para preservar la hora
 * Formato: dd/MM/yyyy - H:mm:ss
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
