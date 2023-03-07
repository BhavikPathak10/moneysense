import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { BankDetails } from '../models/bankDetails.model';

@Injectable({
  providedIn: 'root',
})
export class BankDetailsStore {
  private details: ReplaySubject<BankDetails[]> = new ReplaySubject<
    BankDetails[]
  >(1);

  bindStore(): Observable<any> {
    return this.details.asObservable();
  }

  setStore(details: BankDetails[]): void {
    this.details.next(details);
  }
}
