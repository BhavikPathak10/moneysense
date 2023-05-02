import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
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
