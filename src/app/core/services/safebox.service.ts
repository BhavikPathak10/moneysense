import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterStore } from '../stores/master.store';
import { SafeBoxStore } from '../stores/safebox.store';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SafeboxService {
  constructor(private api: ApiService, private safeBoxStore: SafeBoxStore) {}

  getSafeBoxDetails(): Observable<any> {
    return this.api.get('safebox');
  }

  addSafeBoxData(data: any): Observable<any> {
    return this.api.post('safebox', data);
  }

  deleteSafeBox(id: any): Observable<any> {
    return this.api.delete(`safebox/${id}`);
  }

  updateSafeBox(id:any,data: any): Observable<any> {
    return this.api.put(`safebox/${id}`, data);
  }

  syncStore(data?:any) {
    if(data){
      this.safeBoxStore.setStore({id:Object.keys(data)[0],value:Object.values(data)[0]});
      return;
    }
    this.getSafeBoxDetails().subscribe((data) => {
      if(data){
        this.safeBoxStore.setStore({id:Object.keys(data)[0],value:Object.values(data)[0]});
      }
    });
  }

}
