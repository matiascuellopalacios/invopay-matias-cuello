import { Component, OnInit, ChangeDetectorRef, AfterViewInit, AfterViewChecked, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SellService } from '../services/sell/sell.service';
import { Subscription } from 'rxjs';
import { AmountFormatPipe } from 'projects/base/src/shared/Utils/amount-format-pipe.pipe';
import { CurrencySymbolPipe } from 'projects/base/src/shared/Utils/currency-simbol-pipe';
import { CardConfig } from '../../shared/models/movile-table';
import { CustomDatePipe } from 'projects/base/src/shared/Utils/pipeCustomDate';
import { FormControl } from '@angular/forms';

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
      headerKey: 'installmentNumber',
      headerLabel: this.translate.instant('IP.SELL_DETAIL.TABLE.N_PAYMENTS'),
      fields: [
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_VALUE'), key: 'installmentValue' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_EXPIRY'), key: 'dueDate' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_STATUS'), key: 'paymentStatus' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_PAYMENT'), key: 'paymentDate' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_COMMISSION'), key: 'paidCommission' },
        { label: this.translate.instant('IP.SELL_DETAIL.TABLE.COMMISSION_VALUE'), key: 'commissionValue', highlight: true, isAmount: true }
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
  commissionValue:number=0;
  premiumValue:number=0;  
  subscription=new Subscription();
  saleId:number=0;
  saleDetail:any;
  data: any[] = []
  columns = [
    'installmentNumber',
    'installmentValue',
    'dueDate',
    'paymentStatus',
    'paymentDate',
    'paidCommission',
    'commissionValue'
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

  // Form controls deshabilitados
  saleDateControl = new FormControl({value: '', disabled: true});
  policyValueControl = new FormControl({value: '', disabled: true});
  commissionValueControl = new FormControl({value: '', disabled: true});
  productControl = new FormControl({value: '', disabled: true});
  premiumValueControl = new FormControl({value: '', disabled: true});
  paymentFrequencyControl = new FormControl({value: '', disabled: true});
  policyNumberControl = new FormControl({value: '', disabled: true});
  brokerCommissionControl = new FormControl({value: '', disabled: true});
  customerNameControl = new FormControl({value: '', disabled: true});
  customerEmailControl = new FormControl({value: '', disabled: true});
  customerPhoneControl = new FormControl({value: '', disabled: true});

  /**
   * Load detail
   */
  loadDetail(){
    const sub=this.sellService.getSaleById(this.saleId).subscribe({
      next:(res)=>{
        console.log(res);
      this.saleDetail=res;
      const symbol = this.currencyPipe.transform(res.currency);
      this.commissionValue=res.amount;
      this.premiumValue=res.policyData.amount;
      this.saleDetail.amount=this.amountPipe.transform(this.saleDetail.amount, true, symbol, this.saleDetail.currency)
      this.saleDetail.policyData.premiumAmount=this.amountPipe.transform(this.saleDetail.policyData.premiumAmount, true, symbol, this.saleDetail.currency)
      this.saleDetail.policyData.amount=this.amountPipe.transform(this.saleDetail.policyData.amount, true, symbol, this.saleDetail.currency)
      this.saleDateControl.setValue(this.datePipe.transform(res.saleDate));
      this.policyValueControl.setValue(this.saleDetail.policyData.amount);
      this.commissionValueControl.setValue(this.saleDetail.amount);
      this.productControl.setValue(res.productName);
      this.premiumValueControl.setValue(this.saleDetail.policyData.premiumAmount);
      this.paymentFrequencyControl.setValue(this.translate.instant(this.getPaymentFrequencyKey()));
      this.policyNumberControl.setValue(res.policyData.number);
      this.brokerCommissionControl.setValue('%' + this.calculatePolicyPercentage());
      this.customerNameControl.setValue(res.customer.fullName);
      this.customerEmailControl.setValue(res.customer.email);
      this.customerPhoneControl.setValue(res.customer.phoneNumber);

      this.data = this.saleDetail.policyData.premiumPaymentPlan.map((item: any) => {
        const commissionAmount = (item.amount * this.commissionValue) / this.premiumValue;
        
        return {
          installmentNumber: item.installmentNumber,
          installmentValue: this.amountPipe.transform(item.amount, true, symbol, this.saleDetail.currency),
          dueDate: this.datePipe.transform(item.dueDate),
          paymentStatus: item.isPaid ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
          paymentDate: item.isPaid ? item.dueDate : '-',
          paidCommission: item.isPaid ? this.translate.instant('IP.YES') : this.translate.instant('IP.NO'),
          commissionValue: this.amountPipe.transform(commissionAmount, true, symbol, this.saleDetail.currency)
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
  * Policy percentage
  */
 calculatePolicyPercentage():string{
  const policyAmount = this.premiumValue
  const saleAmount = this.commissionValue
  const commissionPercentage = (saleAmount / policyAmount) * 100;
  return Math.round(commissionPercentage).toString();
 }

  /**
   * Pagination
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
      ['installmentNumber', this.translate.instant('IP.SELL_DETAIL.TABLE.N_PAYMENTS')],
      ['installmentValue', this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_VALUE')],
      ['dueDate', this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_EXPIRY')],
      ['paymentStatus', this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_STATUS')],
      ['paymentDate', this.translate.instant('IP.SELL_DETAIL.TABLE.DATE_PAYMENT')],
      ['paidCommission', this.translate.instant('IP.SELL_DETAIL.TABLE.PAYMENT_COMMISSION')],
      ['commissionValue', this.translate.instant('IP.SELL_DETAIL.TABLE.COMMISSION_VALUE')]
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
  
  return frequencyMap[installments] || `${installments} installments`;
}
  /**
   * Go back to sales list
   */
  goBack(){
    this.router.navigate(['/invopay/sell-list']);
  }
}
