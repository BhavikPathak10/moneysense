import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { BankDetails } from '../models/bankDetails.model';
import { Transaction } from '../models/transaction.model';
import { TransactionStore } from '../stores/transaction.store';
import { ApiService } from './api.service';
import { BankService } from './bank.service';
import { LedgerServiceService } from './ledger-service.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  transactions: Transaction[] = [];

  public returnBank$: ReplaySubject<string> = new ReplaySubject<string>(1);
  public selectedTransaction$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private api: ApiService,
    private transactionStore: TransactionStore,
    private bankService: BankService,
    private ledgerService: LedgerServiceService
  ) {
    this.transactionStore.bindStore().subscribe((data) => {
      this.transactions = data;
    });
  }

  getTransactionDetails(): Observable<any> {
    return this.api.get('transactions');
  }

  add(data: Transaction): Observable<any> {
    this.ledgerService.addLedgerDetails(data);
    return this.api.post('transactions', data);
  }

  delete(rec: Transaction|any,key?:string): Observable<any> {
    if(key){
      rec.id = rec[key];
    }
    this.ledgerService.removeLedgerDetails(rec.id);
    return this.api.delete(`transactions/${rec.id}`);
  }

  update(data: any): Observable<any> {
    return this.api.post('transactions', data);
  }

  put(data: any): Observable<any> {
    return this.api.put('transactions', data);
  }

  syncStore(data?:any) {
    if(data){
      this.transactionStore.setStore(this.api.convertDBData_ObjToArray(data));
      return;
    }
    this.getTransactionDetails().subscribe((data) => {
      this.transactionStore.setStore(this.api.convertDBData_ObjToArray(data));
    });
  }

  deleteBankTransaction(bank: BankDetails) {
    let transactions = this.transactions.filter(
      (t) => t.accountName == bank.accountName
    );

    Promise.all(transactions.map((t) => this.delete(t).subscribe())).then(
      (value) => {
        this.bankService.deleteBank(bank.id).subscribe(
          (data) => {
            this.bankService.syncStore();
          },
          (err) => {}
        );
      },
      (reason) => {}
    );
  }


}
