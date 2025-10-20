import { Component, OnInit, ChangeDetectorRef, AfterViewInit, AfterViewChecked, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SellService } from '../../services/sell/sell.service';
import { Subscription } from 'rxjs';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { CardConfig } from '../../interface/movile-table';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';

@Component({
  selector: 'app-sell-detail',
  templateUrl: './sell-detail.component.html',
  styleUrls: ['./sell-detail.component.scss']
})
export class SellDetailComponent implements OnInit,OnDestroy {
  ngOnInit(): void {
    this.initializeTranslations();
    this.initializeMobileCardConfig();
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    localStorage.getItem('idSale');
    if(localStorage.getItem('idSale')){
      this.saleId=Number(localStorage.getItem('idSale'));
      this.loadDetail();
    }else{
      this.goBack();
    }
    
  }
  
  private initializeMobileCardConfig(): void {
    this.mobileCardConfig = {
      headerKey: 'nCuota',
      headerLabel: this.translate.instant('IP.SELL_DETAIL.TABLE.N_PAYMENTS'),
      fields: [
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_VALUE'), key: 'valorCuota' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_EXPIRY'), key: 'fechaVencimiento' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_STATUS'), key: 'estadoPago' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_PAYMENT'), key: 'fechaPago' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_COMMISSION'), key: 'comisionPagada' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.COMMISSION_VALUE'), key: 'valorComision', highlight: true, isAmount: true }
      ],
      showActionButton: false
    };
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    localStorage.removeItem('idSale');
  }

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly router=inject(Router);
  private readonly amountPipe = inject(AmountFormatPipe);
  private readonly currencyPipe = inject(CurrencySymbolPipe);
  private readonly sellService=inject(SellService)
  private readonly datePipe=inject(CustomDatePipe)
  commisionValue:number=0;
  primeValue:number=0;  
  subscription=new Subscription();
  saleId:number=0;
  saleDetail:any;
  data: any[] = []
  columns = [
    'nCuota',
    'valorCuota',
    'fechaVencimiento',
    'estadoPago',
    'fechaPago',
    'comisionPagada',
    'valorComision'
  ];
  
  titlesFile = new Map<string, string>();
  tableStyle = 'invopay';
  currentPages: number = 1;
  itemsPerPage: number = 5;
  paginatedData: any[] = [];
  totalItems: number = 0;
  showPaginator: boolean = true;
  paginatorKey: number = 0;
  isLoading: boolean = false;
  mobileCardConfig!: CardConfig;

  /**
   * Cargar detalle
   */
  loadDetail(){
    const sub=this.sellService.getSaleById(this.saleId).subscribe({
      next:(res)=>{
        console.log(res);
      this.saleDetail=res;
      const symbol = this.currencyPipe.transform(res.currency);
      this.commisionValue=res.amount;
      this.primeValue=res.policyData.amount;
      this.saleDetail.amount=this.amountPipe.transform(this.saleDetail.amount, true, symbol, this.saleDetail.currency)
      this.saleDetail.policyData.premiumAmount=this.amountPipe.transform(this.saleDetail.policyData.premiumAmount, true, symbol, this.saleDetail.currency)
      this.saleDetail.policyData.amount=this.amountPipe.transform(this.saleDetail.policyData.amount, true, symbol, this.saleDetail.currency)
      
      this.data = this.saleDetail.policyData.premiumPaymentPlan.map((item: any) => {
        const commissionAmount = (item.amount * this.commisionValue) / this.primeValue;
        
        return {
          nCuota: item.installmentNumber,
          valorCuota: this.amountPipe.transform(item.amount, true, symbol, this.saleDetail.currency),
          fechaVencimiento: this.datePipe.transform(item.dueDate),
          estadoPago: item.isPaid ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
          fechaPago: item.isPaid ? item.dueDate : '-',
          comisionPagada: item.isPaid ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
          valorComision: this.amountPipe.transform(commissionAmount, true, symbol, this.saleDetail.currency)
        };
      });
        this.loadData();
      },error:(err)=>{
        console.error('Error fetching sale detail:', err);
        this.goBack();
      }
    })
    this.subscription.add(sub);
  }

  /*
  * Porcentaje dela poliza 
  */
 caluclatePolicyPercentage():string{
  const policyAmount = this.primeValue
  const saleAmount = this.commisionValue
  const commissionPercentage = (saleAmount / policyAmount) * 100;
  return Math.round(commissionPercentage).toString();
 }

  /**
   * Paginación
   */
  onPageChange(page: number) {
    this.currentPages = page;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    this.paginatedData = this.data;
  }
  
  loadData(): void {
    console.log(this.data);
    this.totalItems = this.data.length;
    this.updatePaginatedData();
  }
  /**
   * Translate
   */
  private initializeTranslations() {
    this.titlesFile = new Map<string, string>([
      ['nCuota', this.translate.instant('IP.SELL_DETAIL.TABLE.N_PAYMENTS')],
      ['valorCuota', this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_VALUE')],
      ['fechaVencimiento', this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_EXPIRY')],
      ['estadoPago', this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_STATUS')],
      ['fechaPago', this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_PAYMENT')],
      ['comisionPagada', this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_COMMISSION')],
      ['valorComision', this.translate.instant('IP.SELL_DETAIL.TABLE.COMMISSION_VALUE')]
    ]);
    this.cdr.detectChanges();
  }
  getPaymentFrequencyKey(): string {
  const installments = this.saleDetail?.premiumPaymentInstallments;
  
  if (!installments) return 'IP.SELL_DETAIL.NOT_AVAILABLE';
  
  const frequencyMap: { [key: number]: string } = {
    1: 'IP.SELL_DETAIL.FREQUENCY.ANNUAL',
    2: 'IP.SELL_DETAIL.FREQUENCY.BIANNUAL',
    3: 'IP.SELL_DETAIL.FREQUENCY.QUARTERLY_4',
    4: 'IP.SELL_DETAIL.FREQUENCY.QUARTERLY',
    6: 'IP.SELL_DETAIL.FREQUENCY.BIMONTHLY',
    12: 'IP.SELL_DETAIL.FREQUENCY.MONTHLY'
  };
  
  return frequencyMap[installments] || `${installments} cuotas`;
}
  /**
   * Volver a la lista de ventas
   */
  goBack(){
    this.router.navigate(['/invopay/sell-list']);
  }
}
