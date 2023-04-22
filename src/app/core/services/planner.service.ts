import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlannerStore } from '../stores/planner.store';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  constructor(private api:ApiService, private plannerStore : PlannerStore) { }

  getPlannerDetails(): Observable<any> {
    return this.api.get('planner');
  }

  addPlannerData(data: any): Observable<any> {
    return this.api.post('planner', data);
  }

  deletePlanner(id: any): Observable<any> {
    return this.api.delete(`planner/${id}`);
  }

  updatePlannerData(data: any): Observable<any> {
    return this.api.put(`planner/${data.id}`, data);
  }

  syncStore(data?:any) {
    if(data){
      this.plannerStore.setStore(this.api.convertDBData_ObjToArray(data));
      return;
    }
    this.getPlannerDetails().subscribe((data) => {
      this.plannerStore.setStore(this.api.convertDBData_ObjToArray(data));
    });
  }
}
