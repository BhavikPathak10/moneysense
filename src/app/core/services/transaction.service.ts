import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  delete(rec: Transaction): Observable<any> {
    this.ledgerService.removeLedgerDetails(rec.id);
    return this.api.delete(`transactions/${rec.id}`);
  }

  update(data: any): Observable<any> {
    return this.api.post('transactions', data);
  }

  put(data: any): Observable<any> {
    return this.api.put('transactions', data);
  }

  syncStore() {
    this.getTransactionDetails().subscribe((data) => {
      this.transactionStore.setStore(data);
    });
  }

  deleteBankTransaction(bank: BankDetails) {
    let transactions = this.transactions.filter(
      (t) => t.accountName == bank.accountName
    );

    Promise.all(transactions.map((t) => this.delete(t).subscribe())).then(
      (value) => {
        console.log('Transactions deleted successfully');
        this.bankService.deleteBank(bank.id).subscribe(
          (data) => {
            console.log('Bank Deleted successfully');
          },
          (err) => {
            console.log('Unable to delete bank, Please try again later.');
          }
        );
      },
      (reason) => {
        console.log(reason);
      }
    );
  }
}
