import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SafeBoxStore {
  private details: ReplaySubject<any> = new ReplaySubject<any[]>(1);

  bindStore(): Observable<any> {
    return this.details.asObservable();
  }

  setStore(details: any): void {
    this.details.next(details);
  }
}
