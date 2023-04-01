import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Master } from 'src/app/core/enums/master.enum';
import { PendingPaymentModel } from 'src/app/core/models/pendingPayement.model';
import { PendingPaymentService } from 'src/app/core/services/pending-payment.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { MasterStore } from 'src/app/core/stores/master.store';
import { PendingPaymentStore } from 'src/app/core/stores/pendingPayemnt.store';

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


  constructor(private pendingPayemntStore : PendingPaymentStore ,private masterStore:MasterStore, private pendingPaymentService : PendingPaymentService, private toast: ToastMessageService) { 
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
            obs = this.pendingPaymentService.updatePendingPaymentDetails(data);
        break;
        default:
        break;
    }
    return obs;
  }

}
