import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { BankDetails } from '../models/bankDetails.model';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class LedgerStore {
    private details: ReplaySubject<Transaction[]> = new ReplaySubject<
    Transaction[]
  >(1);

  bindStore(): Observable<any> {
    return this.details.asObservable();
  }

  setStore(details: Transaction[]): void {
    this.details.next(details);
  }
}
