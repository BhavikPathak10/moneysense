import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterStore } from '../stores/master.store';
import { ApiService } from './api.service';
import { LedgerServiceService } from './ledger-service.service';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  constructor(private api: ApiService, private masterStore: MasterStore,private ledgerService : LedgerServiceService) {}

  getMasterDetails(): Observable<any> {
    return this.api.get('master');
  }

  addMasterData(data: any): Observable<any> {
    return this.api.post('master', data);
  }

  deleteMaster(id: any): Observable<any> {
    return this.api.delete(`master/${id}`);
  }

  updateMasterData(data: any): Observable<any> {
    return this.api.post('master', data);
  }

  syncStore() {
    this.getMasterDetails().subscribe((data) => {
      this.masterStore.setStore(data);
    });
  }
}
