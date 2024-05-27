import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
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
  pendingPayment_paymentDetails: any;
  pendingPayment_transactionDetails: any;

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
          if(!data.isPendingPayment){
            this.activePlanInstance = this.planners.find((p)=>p.id == data.record.idx);
          }
        })
      )
   }

  ngOnInit(): void {
    if(this.data.from=='PendingPayment'){
       this.pendingPayment_paymentDetails = {
        bank: '' ,
        particular:this.data.record.ledger ? this.data.record.ledger :'',
        reference:'' ,
        transactionType:'',
        transactionMode:'',
        remark: this.data.record.remark ? this.data.record.remark : ''
      }
      this.pendingPayment_transactionDetails = {
        date: this.data.record.dueDate, 
        amount: this.data.record.amountPaid
      }
    }else if(this.data.from=='IncomeAtGlance'){
      this.pendingPayment_paymentDetails = {
        bank:  this.data.record.account ? this.data.record.account : '',
        particular:this.data.record.clientName ? this.data.record.clientName :'',
        reference:this.data.record.month && this.data.record.billNumber ? this.data.record.month+'-'+this.data.record.billNumber:'',
        transactionType:'',
        transactionMode:'',
        remark: ''
      }
      this.pendingPayment_transactionDetails = {
        date: this.data.record.paymentRcvdDate, 
        amount: this.data.record.amountRcvd
      } 
    }
  }

  onUpdateTransactionDetail(data:any){
    this.paymentDetails = data;
  }

  onDoneClick(){
    let planDetail = this.plannerService.getPlanDetails(this.activePlanInstance.id);
    let planDetailSub = planDetail.subscribe((planDetailData)=>{
      let paymentdata = this.addcomputedValues(this.paymentDetails);
      this.transactionService.add(paymentdata).subscribe((result)=>{
        if(result && result.name){
          this.paymentDetails.transactionId = result.name;
          this.paymentDetails.taskdate = this.data.record.taskdate;
          if(!planDetailData.hasOwnProperty('completedDates')){
            planDetailData['completedDates'] = [];
          }
          this.paymentDetails.budget = this.activePlanInstance.taskEstBudget;
          planDetailData['completedDates'].push(this.paymentDetails);
          this.plannerService.updatePlannerData({...planDetailData,id:this.activePlanInstance.id}).subscribe(()=>{
            this.transactionService.syncStore();
            this.plannerService.syncStore();
            this.toast.success('Transaction has been added and this instance is marked as completed .', 'close');
            planDetailSub.unsubscribe();
            this.dialogRef.close();
          })
        }
      })
    })
  }

  onPendingPaymentDoneClick(){
    let paymentdata = this.addcomputedValues(this.paymentDetails);
    this.transactionService.add(paymentdata).subscribe((result)=>{
      this.transactionService.syncStore();
      this.toast.success('Transaction has been added.', 'close');
      this.dialogRef.close({isTransactionAdded:true});
    })
  }

  onIncomeAtGlanceDoneClick(){
    let paymentdata = this.addcomputedValues(this.paymentDetails);
    this.transactionService.add(paymentdata).subscribe((result)=>{
      this.transactionService.syncStore();
      this.toast.success('Transaction has been added.', 'close');
      this.dialogRef.close({isTransactionAdded:true});
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
