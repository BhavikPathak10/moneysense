import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IncomeAtGlanceModel } from '../models/incomeAtGlance.model';
import { IncomeAtGlanceStore } from '../stores/incomeAtGlance.store';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(private api: ApiService, private incomeStore : IncomeAtGlanceStore) { }


  getIncomeAtGlanceDetails(): Observable<any> {
    return this.api.get('incomeAtGlance');
  }

  addIncomeAtGlance(data: any): Observable<any> {
    return this.api.post('incomeAtGlance', data);
  }

  deleteIncomeAtGlance(id: any): Observable<any> {
    return this.api.delete(`incomeAtGlance/${id}`);
  }

  updateIncomeAtGlanceDetails(data: IncomeAtGlanceModel): Observable<any> {
    return this.api.put(`incomeAtGlance/${data.id}`, data);
  }

  calcComputedData(rowData:IncomeAtGlanceModel){

    let iGST = rowData.igst ? rowData.igst : 0;
    let sGST = rowData.sgst ? rowData.sgst : 0;
    let cGST = rowData.cgst ? rowData.cgst : 0;

    rowData.totalTax = iGST + cGST + sGST;
    rowData.totalAmount = rowData.billAmount + rowData.totalTax;
    rowData.afterTDS = rowData.billAmount*0.9+rowData.totalTax;
    rowData.amountRcvd = rowData.amountRcvd ? rowData.amountRcvd : 0;
    rowData.pendingAmount = rowData.afterTDS - rowData.amountRcvd;
    return rowData;
  }


  syncStore(){
    this.getIncomeAtGlanceDetails().subscribe(data=>{
      this.incomeStore.setStore(data);
    })
  }
}
