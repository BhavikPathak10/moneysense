import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { Observable, Subscription } from 'rxjs';
import { Master } from 'src/app/core/enums/master.enum';
import { PendingPaymentModel } from 'src/app/core/models/pendingPayement.model';
import { PendingPaymentService } from 'src/app/core/services/pending-payment.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { MasterStore } from 'src/app/core/stores/master.store';
import { PendingPaymentStore } from 'src/app/core/stores/pendingPayemnt.store';
import { ConfirmPlannerDetailsComponent } from 'src/app/shared/component/confirm-planner-details/confirm-planner-details.component';

@Component({
  selector: 'app-pending-payment',
  templateUrl: './pending-payment.component.html',
  styleUrls: ['./pending-payment.component.scss']
})
export class PendingPaymentComponent implements OnInit {

  subscription:Subscription[] = [];

  pendingPaymentDetails: PendingPaymentModel[] = [];
  uniqueLedger : any = [];
  MASTER = Master;
  editPrevPayment: any;
  isToggleEnabled = false;

  @ViewChild(DxDataGridComponent,{static:false}) dataGrid?: DxDataGridComponent;

  constructor(
    private pendingPayemntStore : PendingPaymentStore ,
    private masterStore:MasterStore, 
    private pendingPaymentService : PendingPaymentService, 
    private toast: ToastMessageService,
    private dialog : MatDialog
    ) { 
    this.subscription.push(
      this.pendingPayemntStore.bindStore().subscribe((data)=>{
        this.pendingPaymentDetails = data;
      }),
      this.masterStore.bindStore().subscribe((data)=>{        
        this.uniqueLedger = [...new Set(data.map((d:any)=>d[this.MASTER.LEDGER]))];
      })
    )
  }

  ngOnInit(): void {
  }

  savePayment(e:any){
    if(e.changes.length < 1){
      return;
    }
    let computedData = this.pendingPaymentService.calcComputedData(e.changes[0].data || e.changes[0].key);
    this.onSavePaymentDetails(e.changes[0].type,computedData).subscribe((data)=>{
      this.toast.success(`Payment detail ${e.changes[0].type} successful`,'close');
      this.pendingPaymentService.syncStore();
    },(err)=>{
      this.toast.alert('Some error occured, Please try again later.','close');
    });
  }

  onSavePaymentDetails(type:string,data:any):Observable<any>{
    let obs=new Observable();
    switch (type) {
      case 'insert':
        obs = this.pendingPaymentService.addPendingPayment(data);
        break;
        case 'remove':
          obs = this.pendingPaymentService.deletePendingPayment(data.id);
          break;
          case 'update':
            if(data.pendingPayment != this.editPrevPayment){
              this.confirmAddTransactionDetail(data);
            }else{
              obs = this.pendingPaymentService.updatePendingPaymentDetails(data);
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
        from : 'PendingPayment'
      }
    };
    this.dialog?.open(ConfirmPlannerDetailsComponent, dialogObj).afterClosed().subscribe((result)=>{
        this.pendingPaymentService.updatePendingPaymentDetails(p_data).subscribe((success)=>{
          this.toast.success(`Payment detail updated successful`,'close');
          this.pendingPaymentService.syncStore();
        });
    })
  }

  onEditStart(e:any){
    this.editPrevPayment = e.data.pendingPayment;
  }

  onSliderPendingPaymentChange(event:MatSlideToggleChange){
    if(event.checked){
      this.dataGrid?.instance.filter(["pendingPayment", ">", 0]);
      this.isToggleEnabled = true;
    }else{
      this.dataGrid?.instance.clearFilter();
      this.isToggleEnabled = false;
    }
  }

  ngOnDestroy():void{
    this.subscription.map(sub=>sub.unsubscribe());
  }

}
