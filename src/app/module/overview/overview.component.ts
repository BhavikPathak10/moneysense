import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { IncomeAtGlanceModel } from 'src/app/core/models/incomeAtGlance.model';
import { PendingPaymentModel } from 'src/app/core/models/pendingPayement.model';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { IncomeAtGlanceStore } from 'src/app/core/stores/incomeAtGlance.store';
import { PendingPaymentStore } from 'src/app/core/stores/pendingPayemnt.store';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {

  subscription: Subscription[] = [];
  banks : BankDetails[] = [];
  incomeAtGlanceBalance? :any = 0;
  pendingPaymentBalance? :any = 0;
  
  constructor(
    private bankStore: BankDetailsStore,
    private incomeStore : IncomeAtGlanceStore,
    private pendingPaymentStore : PendingPaymentStore,
    private router : Router,
    private route: ActivatedRoute
  ) {
    this.subscription.push(
      this.bankStore.bindStore().subscribe((data) => {
        this.banks = data;
      }),
      this.incomeStore.bindStore().subscribe((data:IncomeAtGlanceModel[]) => {
        this.incomeAtGlanceBalance = 0;
        data.forEach(d=>{
          this.incomeAtGlanceBalance+=d.pendingAmount;
        })
      }),
      this.pendingPaymentStore.bindStore().subscribe((data:PendingPaymentModel[]) => {
        this.pendingPaymentBalance = 0;
        data.forEach(d=>{
          this.pendingPaymentBalance+=d.pendingPayment;
        })
      }),
    )
  }
  
  ngOnInit(): void {}

  navigate(screenName:string){
    this.router.navigate(["..",screenName],{relativeTo:this.route});
  }
  
  onBankRowClick(e:any){
    if(e.rowType == 'data'){
      this.router.navigate(['..','bank',e.data.accountName],{relativeTo:this.route});
    }
  }

  ngOnDestroy():void{
    this.subscription.map(sub=>sub.unsubscribe());
  }

}
