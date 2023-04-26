import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { forkJoin, Subscription } from 'rxjs';
import { TransactionEnum } from 'src/app/core/enums/transaction.enum';
import { Transaction } from 'src/app/core/models/transaction.model';
import { PlannerService } from 'src/app/core/services/planner.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PlannerStore } from 'src/app/core/stores/planner.store';

@Component({
  selector: 'app-confirm-planner-details',
  templateUrl: './confirm-planner-details.component.html',
  styleUrls: ['./confirm-planner-details.component.scss']
})
export class ConfirmPlannerDetailsComponent implements OnInit {

  subscription : Subscription[] = [];

  planners:any[]=[];
  activePlanInstance : any;
  paymentDetails:any;
  transactionEnum = TransactionEnum;

  constructor(
    public dialogRef: MatDialogRef<ConfirmPlannerDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private plannerStore : PlannerStore,
    private plannerService : PlannerService,
    private transactionService : TransactionService,
    private toast : ToastMessageService
    ) {
      this.subscription.push(
        this.plannerStore.bindStore().subscribe((val)=>{
          this.planners = [...val];
          this.activePlanInstance = this.planners.find((p)=>p.id == data.record.idx);
        })
      )
   }

  ngOnInit(): void {}

  onUpdateTransactionDetail(data:any){
    this.paymentDetails = data;
  }

  onDoneClick(){
    let date = moment(this.paymentDetails.transactionDate).format('DD-MMM-YYYY');
    let planDetail = this.plannerService.getPlanDetails(this.activePlanInstance.id);
    let planDetailSub = planDetail.subscribe((data)=>{
      if(!data.hasOwnProperty('completedDates')){
        data['completedDates'] = [];
      }
      data['completedDates'].push(this.paymentDetails);
      let paymentdata = this.addcomputedValues(this.paymentDetails);

      forkJoin({
        plan : this.plannerService.updatePlannerData({...data,id:this.activePlanInstance.id}),
        transaction : this.transactionService.add(paymentdata)
      }).subscribe(()=>{
        this.transactionService.syncStore();
        this.plannerService.syncStore();
        this.toast.success('Transaction has been added and this instance is marked as completed .', 'close');
        planDetailSub.unsubscribe();
        this.dialogRef.close();
      })
    })
  }

  addcomputedValues(p_data: any) {
    let data: Transaction = new Transaction().deserialize(p_data);

    data.accountName = p_data.bank;

    data.withdrawal =
      data.transactionType?.toLowerCase() ==
      this.transactionEnum.WITHDARWAL.toLowerCase()
        ? Number(data.transactionAmount)
        : 0;
    data.deposit =
      data.transactionType?.toLowerCase() ==
      this.transactionEnum.DEPOSIT.toLowerCase()
        ? Number(data.transactionAmount)
        : 0;

    let date = new Date(data.transactionDate);
    let currentYear = +date.toLocaleDateString('default', { year: '2-digit' });
    data.transactionMonth = date.toLocaleDateString('default', {
      month: 'short',
    });
    data.transactionFY =
      date.getMonth() > 2
        ? `FY ${currentYear}-${currentYear + 1}`
        : `FY ${currentYear - 1}-${currentYear}`;

    return data;
  }

  ngOnDestroy(){
    this.subscription.map(sub=>sub.unsubscribe());
  }

}
