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
    this.renderIcons();
    this.renderLogos();
  }
  
  ngAfterViewInit(): void {
    this.renderIcons();
    this.renderLogos();
    this.setupIconClick();
  }
  data: any[] = [];
  originalData: any[] = [];
  columns = [
    'logo',
    'nombreProveedor',
    'canal',
    'activo',
    'descripcion',
    'detalle'
  ];
  
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
            detalle: 'Ver',
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
        if (logoUrl) {
          const img = document.createElement('img');
          img.src = logoUrl;
          img.alt = name;
          img.className = 'provider-logo';
          img.onerror = () => {
            cell.innerHTML = '';
          };
          
          cell.appendChild(img);
        }
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
      ['descripcion', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DESCRIPTION')],
      ['detalle', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DETAIL')]
    ]);
    this.cdr.detectChanges();
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
        if (rowData) console.log('Row data:', rowData);
      }
    });
  }

  isActive(param:boolean): string{
 if(param){
  return this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.YES');
 }else{
  return this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.NO');
}
}
}
