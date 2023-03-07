import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { IncomeAtGlanceModel } from '../models/incomeAtGlance.model';

@Injectable({
  providedIn: 'root',
})
export class IncomeAtGlanceStore {
  private details: ReplaySubject<IncomeAtGlanceModel[]> = new ReplaySubject<
  IncomeAtGlanceModel[]
  >(1);

  bindStore(): Observable<any> {
    return this.details.asObservable();
  }

  setStore(details: IncomeAtGlanceModel[]): void {
    this.details.next(details);
  }
}
