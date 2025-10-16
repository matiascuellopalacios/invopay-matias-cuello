import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProvidersService } from '../../services/providers/providers.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PaymentProvider } from '../../interface/paymentEntities';
@Component({
  selector: 'app-payments-entities-list',
  templateUrl: './payments-entities-list.component.html',
  styleUrls: ['./payments-entities-list.component.scss']
})
export class PaymentsEntitiesListComponent implements OnInit,OnDestroy,AfterViewChecked,AfterViewInit {
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit(): void {
    this.translate.get('IP.PAYMENTS_ENTITIES.TABLE.LOGO').subscribe(() => {
      this.initializeTranslations();
    });
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
    });
    this.loadProviders();
  }
  ngAfterViewChecked(): void {
    this.renderLogos();
  }
  
  ngAfterViewInit(): void {
    this.renderLogos();
  }
  data: any[] = [];
  originalData: any[] = [];
  columns = [
    'logo',
    'nombreProveedor',
    'canal',
    'activo',
    'descripcion'
  ];
  
  actions = ['detail'];
  
  titlesFile = new Map<string, string>();
  tableStyle = 'invopay';
  currentPages: number = 1;
  itemsPerPage: number = 25;
  paginatedData: any[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;
  paginatorKey: number = 0;
  subscription=new Subscription();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly providersService=inject(ProvidersService);


  loadProviders(){
    const sub=this.providersService.getPaymentsEntities().subscribe({
      next:(res)=>{
        const providerData= Array.isArray(res) ? res[0] : res;
        this.originalData = providerData.content.map((prov: PaymentProvider) => {
          
               
          return {
            id: prov.id,
            logo: 'LOGO_PLACEHOLDER',
            nombreProveedor: prov.name,
            canal: prov.paymentChannels,
            activo: this.isActive(prov.isActive),
            descripcion: prov.description,
            _rawData: prov
            };
          });  
          this.data = [...this.originalData]; 
          this.loadData();    
      },
      error:(err)=>{
        console.error('Error fetching providers:', err);
      }
    })
    this.subscription.add(sub);
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
      console.log('Ver detalle:', dataField);
    }
  }

 private renderLogos() {
  const cells = document.querySelectorAll('td');
  cells.forEach((cell, index) => {
    if (cell.textContent?.trim() === 'LOGO_PLACEHOLDER') {
      const tr = cell.closest('tr');
      if (!tr || !tr.parentNode) return;
      const rows = Array.from(tr.parentNode.children);
      const rowIndex = rows.indexOf(tr);
      const rowData = this.paginatedData[rowIndex];
      
      if (rowData && rowData._rawData) {
        const logoUrl = rowData._rawData.logoUrl;
        const name = rowData._rawData.name;
        cell.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = logoUrl || '../../../assets/img/mercado-pago.jpeg';
        img.alt = name;
        img.className = 'provider-logo';
        img.onerror = () => {
          img.src = '../../../assets/img/mercado-pago.jpeg';
        };
        
        cell.appendChild(img);
      }
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

  private initializeTranslations() {
    this.titlesFile = new Map<string, string>([
      ['logo', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.LOGO')],
      ['nombreProveedor', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PROVIDEER')],
      ['canal', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PAYMENT_CHANNEL')],
      ['activo', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.ACTIVE')],
      ['descripcion', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DESCRIPTION')]
    ]);
    this.cdr.detectChanges();
  }

  isActive(param:boolean): string{
 if(param){
  return this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.YES');
 }else{
  return this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.NO');
}
}
}
