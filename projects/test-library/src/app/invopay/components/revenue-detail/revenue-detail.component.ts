import { Component, OnInit, ChangeDetectorRef, AfterViewInit, AfterViewChecked, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RevenueService } from '../../services/revenue/revenue.service';
import { Subscription } from 'rxjs';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { CardConfig } from '../../interface/movile-table';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';

@Component({
  selector: 'app-revenue-detail',
  templateUrl: './revenue-detail.component.html',
  styleUrls: ['./revenue-detail.component.scss']
})
export class RevenueDetailComponent implements OnInit,OnDestroy{
  
  private readonly revenueService=inject(RevenueService);
  private readonly router=inject(Router);
  private readonly datePipe=inject(CustomDatePipe)
  private readonly amountPipe = inject(AmountFormatPipe);
  private readonly currencyPipe = inject(CurrencySymbolPipe);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);

  subscription=new Subscription();
  revenueId:number=0;
  revenueDetail:any;
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
  data: any[] = []
  columns=[
    'nCuota',
    'fechaVencimiento',
    'valorPago'
  ]
  ngOnInit(): void {
    this.initializeTranslations();
    this.initializeMobileCardConfig();
    this.translate.onLangChange.subscribe(() => {
      this.initializeTranslations();
      this.initializeMobileCardConfig();
    });
    localStorage.getItem('idRevenue');
    if(localStorage.getItem('idRevenue')){
      this.revenueId=Number(localStorage.getItem('idRevenue'));
      this.loadDetail();
    }else{
      this.goBack();
    }
  }
  
  private initializeMobileCardConfig(): void {
    this.mobileCardConfig = {
      headerKey: 'nCuota',
      headerLabel: this.translate.instant('IP.REVENUE_DETAIL.TABLE.N_PAYMENTS'),
      fields: [
        { label: this.translate.instant('IP.REVENUE_DETAIL.TABLE.DATE_EXPIRY'), key: 'fechaVencimiento' },
        { label: this.translate.instant('IP.REVENUE_DETAIL.TABLE.PAYMENT_VALUE'), key: 'valorPago', highlight: true, isAmount: true }
      ],
      showActionButton: false
    };
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    localStorage.removeItem('idRevenue');
  }
  /**
   * Volver a la lista de recaudaciones
   */
  goBack(){
    this.router.navigate(['/invopay/revenue-list']);
  }
  /**
   * Cargar el detalle de la recaudacion
   */
  loadDetail(){
    const sub=this.revenueService.getRevenueById(this.revenueId).subscribe({
      next:(res)=>{
        console.log(res);
          this.revenueDetail=res;
          const symbol = this.currencyPipe.transform(res.transactionData.currency);
          const revenueDate = new Date(res.transactionData.revenueDate);
          const fechaHoraFormateada = this.formatDateTimeManual(revenueDate);
          this.revenueDetail.transactionData.revenueDate = fechaHoraFormateada;
          this.revenueDetail.transactionData.amount = this.amountPipe.transform(res.transactionData.amount, true, symbol, res.transactionData.currency);
          this.revenueDetail.conciliationData.policyAmount = this.amountPipe.transform(res.conciliationData.policyAmount, true, symbol, res.transactionData.currency);
          this.revenueDetail.conciliationData.paymentValue = this.amountPipe.transform(res.conciliationData.paymentValue, true, symbol, res.transactionData.currency);
          this.revenueDetail.policyData.amount = this.amountPipe.transform(res.policyData.amount, true, symbol, res.transactionData.currency);
          this.revenueDetail.policyData.saleDate = this.datePipe.transform(res.policyData.saleDate);
          this.revenueDetail.policyData.premiumAmount = this.amountPipe.transform(res.policyData.premiumAmount, true, symbol, res.transactionData.currency);
          this.data = this.revenueDetail.policyData.premiumPaymentPlan.map((item: any) => {
          return {
          nCuota: item.installmentNumber,
          fechaVencimiento: this.datePipe.transform(item.dueDate),
          valorPago: this.amountPipe.transform(item.amount, true, symbol, this.revenueDetail.transactionData.currency)
        };
       
      });
       this.loadData();
        this.isConsolidated();
      },
      error:(err)=>{
        this.goBack();
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
      ['nCuota', this.translate.instant('IP.REVENUE_DETAIL.TABLE.N_PAYMENTS')],
      ['fechaVencimiento', this.translate.instant('IP.REVENUE_DETAIL.TABLE.DATE_EXPIRY')],
      ['valorPago', this.translate.instant('IP.REVENUE_DETAIL.TABLE.PAYMENT_VALUE')]
    ]);
    this.cdr.detectChanges();
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

isConsolidated(): string{
 if(this.revenueDetail?.conciliationData.isConsolidated){
  return this.translate.instant('IP.REVENUE_DETAIL.CONCILIATION_INFO.YES');
 }else{
  return this.translate.instant('IP.REVENUE_DETAIL.CONCILIATION_INFO.NO');
}
}
}
