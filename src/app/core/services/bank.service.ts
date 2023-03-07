import { Injectable } from '@angular/core';
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

  updateBankDetails(data: BankDetails): Observable<any> {
    return this.api.put(`banks/${data.id}`, data);
  }

  syncStore(){
    this.getBankDetails().subscribe(data=>{
      this.bankStore.setStore(data);
    })
  }
}
