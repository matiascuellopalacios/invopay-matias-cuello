import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProvidersService } from '../../services/providers/providers.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PaymentProvider } from '../../interface/paymentEntities';
import { CardConfig } from '../../interface/movile-table';
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
    this.initializeMobileCardConfig();
    this.translate.get('IP.PAYMENTS_ENTITIES.TABLE.LOGO').subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    this.loadProviders();
  }
  
  private initializeMobileCardConfig(): void {
    this.mobileCardConfig = {
      headerKey: 'providerName',
      fields: [
        { label: this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PAYMENT_CHANNEL'), key: 'channel' },
        { label: this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.ACTIVE'), key: 'active' },
        { label: this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DESCRIPTION'), key: 'description' }
      ],
      showActionButton: true,
      actionIcon: 'eye'
    };
  }
  ngAfterViewChecked(): void {
    // Logo rendering is now handled by the table component
  }
  
  ngAfterViewInit(): void {
    // Logo rendering is now handled by the table component
  }
  data: any[] = [];
  originalData: any[] = [];
  columns = [
    'logoUrl',
    'providerName',
    'channel',
    'active',
    'description'
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
  mobileCardConfig!: CardConfig;
  subscription=new Subscription();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly providersService=inject(ProvidersService);
  defaultLogo = './assets/img/mercado-pago.jpeg';

  loadProviders(){
    const sub=this.providersService.getPaymentsEntities().subscribe({
      next:(res)=>{
        const providerData= Array.isArray(res) ? res[0] : res;
        this.originalData = providerData.content.map((prov: PaymentProvider) => {
          
               
          return {
            id: prov.id,
            logoUrl: this.defaultLogo,
            providerName: prov.name,
            channel: prov.paymentChannels,
            active: this.isActive(prov.isActive),
            description: prov.description,
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
      console.log('Ver detalle:', dataField);
    }
  }
  
  onMobileCardAction(item: any): void {
    console.log('Ver detalle:', item);
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
      ['logoUrl', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.LOGO')],
      ['providerName', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PROVIDEER')],
      ['channel', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.PAYMENT_CHANNEL')],
      ['active', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.ACTIVE')],
      ['description', this.translate.instant('IP.PAYMENTS_ENTITIES.TABLE.DESCRIPTION')]
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
