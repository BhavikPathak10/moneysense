import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { PendingPaymentModel } from '../models/pendingPayement.model';

@Injectable({
  providedIn: 'root',
})
export class PendingPaymentStore {
  private details: ReplaySubject<PendingPaymentModel[]> = new ReplaySubject<
  PendingPaymentModel[]
  >(1);

  bindStore(): Observable<any> {
    return this.details.asObservable();
  }

  setStore(details: PendingPaymentModel[]): void {
    this.details.next(details);
  }
}
