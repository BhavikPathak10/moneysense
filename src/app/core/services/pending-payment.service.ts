import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PendingPaymentModel } from '../models/pendingPayement.model';
import { PendingPaymentStore } from '../stores/pendingPayemnt.store';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PendingPaymentService {

  constructor(private api: ApiService,private pendingPaymentStore : PendingPaymentStore) { }

  getPendingPaymentDetails(): Observable<any> {
    return this.api.get('pendingPayment');
  }

  addPendingPayment(data: any): Observable<any> {
    return this.api.post('pendingPayment', data);
  }

  deletePendingPayment(id: any): Observable<any> {
    return this.api.delete(`pendingPayment/${id}`);
  }

  updatePendingPaymentDetails(data: PendingPaymentModel): Observable<any> {
    return this.api.put(`pendingPayment/${data.id}`, data);
  }

  syncStore(){
    this.getPendingPaymentDetails().subscribe(data=>{
      this.pendingPaymentStore.setStore(data);
    })
  }

  calcComputedData(rowData:PendingPaymentModel){
    let invAmt = rowData.invoiceAmount ? rowData.invoiceAmount : 0;
    let amtPaid = rowData.amountPaid ? rowData.amountPaid : 0;
    rowData.pendingPayment = invAmt-amtPaid;
    return rowData;
  }
}
