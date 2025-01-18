import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { IncomeAtGlanceModel } from 'src/app/core/models/incomeAtGlance.model';
import { IncomeService } from 'src/app/core/services/income.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { IncomeAtGlanceStore } from 'src/app/core/stores/incomeAtGlance.store';
import * as moment from 'moment';
import { MasterStore } from 'src/app/core/stores/master.store';
import { Master } from 'src/app/core/enums/master.enum';
import { ConfirmPlannerDetailsComponent } from 'src/app/shared/component/confirm-planner-details/confirm-planner-details.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-income-at-glance',
  templateUrl: './income-at-glance.component.html',
  styleUrls: ['./income-at-glance.component.scss']
})
export class IncomeAtGlanceComponent implements OnInit {

  subscription:Subscription[] = [];
  incomeDetails:IncomeAtGlanceModel[] = [];
  displayedIncomeDetails:IncomeAtGlanceModel[] = [];
  banks:[] =[];
  uniqueClientName:any = [];
  currentYear = moment().year();
  monthsShort : any = moment.monthsShort().map(month => {
    return [this.currentYear, this.currentYear - 1, this.currentYear - 2].map(year => `${month} ${year.toString()}`);
  }).flat().sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
  MASTER = Master;
  prevPaymentRcvdDate:any = undefined;
  isToggleEnabled = false;
  isCurrentYearToggleEnabled = false;

  @ViewChild(DxDataGridComponent,{static:false}) dataGrid?: DxDataGridComponent;

  constructor(
    private incomeStore:IncomeAtGlanceStore,
    private masterStore : MasterStore,
    private incomeService : IncomeService,
    private bankStore: BankDetailsStore,
    private toast :ToastMessageService,
    private dialog : MatDialog
    ) {
    this.subscription.push(
      this.incomeStore.bindStore().subscribe((data)=>{
        this.incomeDetails = data;
        this.displayedIncomeDetails = data;
      }),
      this.bankStore.bindStore().subscribe((data)=>{
        this.banks = data.map((d:BankDetails)=>d.accountName)
      }),
      this.masterStore.bindStore().subscribe((data)=>{
        this.uniqueClientName = [...new Set(data.map((d:any)=>d[this.MASTER.LEDGER]))];
      })
    )
   }

  ngOnInit(): void {
  }
    
  saveIncome(e:any){
    let computedData = this.incomeService.calcComputedData(e.changes[0].data || e.changes[0].key);
    this.onSaveIncomeDetails(e.changes[0].type,computedData).subscribe((data)=>{
      this.toast.success(`Income ${e.changes[0].type} successful`,'close');
      this.incomeService.syncStore();
    },(err)=>{
      this.toast.alert('Some error occured, Please try again later.','close');
    });
  }

  onSaveIncomeDetails(type:string,data:any):Observable<any>{
    let obs=new Observable();
    switch (type) {
      case 'insert':
        obs = this.incomeService.addIncomeAtGlance(data);
        break;
        case 'remove':
          obs = this.incomeService.deleteIncomeAtGlance(data.id);
          break;
          case 'update':
            if(this.prevPaymentRcvdDate != data.paymentRcvdDate && moment(data.paymentRcvdDate).isBefore()){
              data.amountRcvd = data.amountRcvd + data.pendingAmount;
              data.pendingAmount = 0;
               this.confirmAddTransactionDetail(data);
              }else{
               obs = this.incomeService.updateIncomeAtGlanceDetails(data);
            }
        break;
        default:
        break;
    }
    return obs;
  }

  confirmAddTransactionDetail(p_data:any){
    let dialogObj = {
      minWidth: 450,
      data: {
        record:p_data,
        from : 'IncomeAtGlance'
      }
    };
    this.dialog?.open(ConfirmPlannerDetailsComponent, dialogObj).afterClosed().subscribe((result:any)=>{
        this.incomeService.updateIncomeAtGlanceDetails(p_data).subscribe((success)=>{
          this.toast.success(`Income at glance detail updated successful`,'close');
          this.incomeService.syncStore();
        });
    })
  }

  onSliderPendingIncomeChange(event:MatSlideToggleChange){
    if(event.checked){
      this.dataGrid?.instance.filter(["pendingAmount", ">", 0]);
      this.isToggleEnabled = true;
    }else{
      this.dataGrid?.instance.clearFilter();
      this.isToggleEnabled = false;
    }
  }

  onSliderCurrentYearPendingIncomeChange(event:MatSlideToggleChange){
    if(event.checked){
      this.displayedIncomeDetails = [...this.incomeDetails.filter(data=>data.month?.endsWith(this.currentYear.toString()))];
      this.isCurrentYearToggleEnabled = true;
    }else{
      this.displayedIncomeDetails = [...this.incomeDetails];
      this.isCurrentYearToggleEnabled = false;
    }
  }

  onEditStart(e:any){
    this.prevPaymentRcvdDate = e.data.paymentRcvdDate;
  }

}
