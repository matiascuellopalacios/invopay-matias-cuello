import { Component, OnInit, ChangeDetectorRef, AfterViewInit, AfterViewChecked, inject, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SellService } from '../../services/sell/sell.service';
import { Subscription } from 'rxjs';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { Router } from '@angular/router';
import { Sale } from '../../interface/Sales';
import { SellsListState } from '../../interface/saleFilters';

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
    'nombreProducto',
    'broker',
    'cliente',
    'montoPoliza',
    'montoPrima'
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
  selectedProduct: string = '';
  selectedBroker: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  
  maxDate: string = '';
  minDateHasta: string = '';
  
  paginatorKey: number = 0;
  isLoading: boolean = false;
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  ngAfterViewChecked(): void {
  }
  
  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.setMaxDate();
    
    this.translate.get('IP.SELLS_LIST.TABLE.SALE_DATE').subscribe(() => {
      this.initializeTranslations();
    });
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
    });
    
    this.loadSalesFromBackend();
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
  
  /**
   * loadSalesFromBackend
   * --------------------
   * Carga los datos desde el backend y los mapea a la estructura del componente.
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
              nombreProducto: sale.productName,
              broker: sale.brokerName,
              cliente: sale.customerName,
              montoPoliza: this.amountPipe.transform(sale.policyAmount, true, symbol, sale.currency),
              montoPrima: this.amountPipe.transform(sale.premiumAmount, true, symbol, sale.currency),
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
          console.error('Error al cargar las ventas:', error);
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
   * Convierte una fecha del backend (ISO string o formato yyyy-MM-dd) a formato DD/MM/YYYY.
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
   * Filtra los datos del mes actual sin modificar los inputs.
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
      ['nombreProducto', this.translate.instant('IP.SELLS_LIST.TABLE.PRODUCT_NAME')],
      ['broker', this.translate.instant('IP.SELLS_LIST.TABLE.BROKER_NAME')],
      ['cliente', this.translate.instant('IP.SELLS_LIST.TABLE.CLIENT_NAME')],
      ['montoPoliza', this.translate.instant('IP.SELLS_LIST.TABLE.POLICY_AMOUNT')],
      ['montoPrima', this.translate.instant('IP.SELLS_LIST.TABLE.PREMIUM_AMOUNT')],
    ]);
    this.cdr.detectChanges();
  }
  
  /**
   * restoreState
   * ------------
   * Restaura los filtros y paginación desde el service
   */
  private restoreState(): void {
    const state = this.saleServices.getState();
    if (!state) return;

    this.fechaDesde = state.fechaDesde;
    this.fechaHasta = state.fechaHasta;
    this.selectedProduct = state.selectedProduct;
    this.selectedBroker = state.selectedBroker;
    
    if (this.fechaDesde) {
      this.minDateHasta = this.fechaDesde;
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
   * Guarda el estado actual de filtros y paginación
   */
  private saveCurrentState(): void {
    const state: SellsListState = {
      currentPage: this.currentPages,
      itemsPerPage: this.itemsPerPage,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      selectedProduct: this.selectedProduct,
      selectedBroker: this.selectedBroker,
      filteredData: [...this.data]
    };
    
    this.saleServices.saveState(state);
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

  onTableAction(event: any): void {
    const { event: action, dataField } = event;
    if (action === 'detail') {
      this.onViewDetail(dataField);
    }
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
      if (key === 'montoPoliza' || key === 'montoPrima') {
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
    if (!this.fechaDesde && !this.fechaHasta && !this.selectedProduct && !this.selectedBroker) {
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
      const fechaDesdeDate = this.parseDate(this.fechaDesde);
      filteredData = filteredData.filter(item => {
        const itemDate = this.parseDateFromString(item.paymentDate);
        return itemDate >= fechaDesdeDate;
      });
    }
    
    if (this.fechaHasta) {
      const fechaHastaDate = this.parseDate(this.fechaHasta);
      filteredData = filteredData.filter(item => {
        const itemDate = this.parseDateFromString(item.paymentDate);
        return itemDate <= fechaHastaDate;
      });
    }
    
    if (this.selectedProduct) {
      filteredData = filteredData.filter(item => 
        this.normalizeString(item.nombreProducto).includes(this.normalizeString(this.getProductName(this.selectedProduct)))
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
   * Valida que el rango de fechas no sea mayor a 3 meses
   */
  private validateDateRange(fechaDesde: string, fechaHasta: string): boolean {
    const desde = this.parseDate(fechaDesde);
    const hasta = this.parseDate(fechaHasta);
    
    const monthsDiff = (hasta.getFullYear() - desde.getFullYear()) * 12 + 
                       (hasta.getMonth() - desde.getMonth());
    
    return monthsDiff <= 3 && hasta >= desde;
  }
  
  /**
   * onClearFilters
   * --------------
   * Limpia todos los filtros y vuelve a mostrar los datos del mes actual
   */
  onClearFilters(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.selectedProduct = '';
    this.selectedBroker = '';
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
   * parseDate
   * ---------
   * Convierte un string en formato YYYY-MM-DD a objeto Date
   */
  private parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  /**
   * parseDateFromString
   * -------------------
   * Convierte un string en formato DD/MM/YYYY a objeto Date
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
    console.log('Ver detalle de:', row.id);
    this.navigatingToDetail = true;
    this.saveCurrentState();
    localStorage.setItem('idSale', JSON.stringify(row.id));
    this.router.navigate(['/invopay/sale-detail']);
  }
}
