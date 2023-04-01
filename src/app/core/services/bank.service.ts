import { Injectable } from '@angular/core';
import { Subscriber } from 'rxjs';
import { Observable } from 'rxjs';
import { BankDetails } from '../models/bankDetails.model';
import { BankDetailsStore } from '../stores/bank.store';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  constructor(private api: ApiService,private bankStore : BankDetailsStore) {}

  getBankDetails(): Observable<any> {
    return this.api.get('banks');
  }

  addBank(data: any): Observable<any> {
    return this.api.post('banks', data);
  }

  deleteBank(id: any): Observable<any> {
    return this.api.delete(`banks/${id}`);
  }

  updateBankDetails(data: BankDetails): Observable<any>| undefined {
    if(data.id){
      return this.api.put(`banks/${data.id}`, data);
    }
    return new Observable();
  }

  syncStore(data?:any){
    if(data){
      this.bankStore.setStore(this.api.convertDBData_ObjToArray(data));
      return;
    }
    this.getBankDetails().subscribe(data=>{
      this.bankStore.setStore(this.api.convertDBData_ObjToArray(data));
    })
  }
}
