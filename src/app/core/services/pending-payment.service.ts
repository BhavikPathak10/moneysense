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

  syncStore(data?:any){
    if(data){
      this.pendingPaymentStore.setStore(this.api.convertDBData_ObjToArray(data));
      return;
    }
    this.getPendingPaymentDetails().subscribe(data=>{
      this.pendingPaymentStore.setStore(this.api.convertDBData_ObjToArray(data));
    })
  }

  calcComputedData(rowData:PendingPaymentModel){
    rowData.invoiceAmount = rowData.invoiceAmount ? rowData.invoiceAmount : 0;
    rowData.amountPaid = rowData.amountPaid ? rowData.amountPaid : 0;

    rowData.pendingPayment = rowData.invoiceAmount-rowData.amountPaid;
    return rowData;
  }
}
