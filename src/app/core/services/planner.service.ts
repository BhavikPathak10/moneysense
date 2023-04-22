import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { datetime, RRule } from 'rrule';
import { Observable } from 'rxjs';
import { PlannerStore } from '../stores/planner.store';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PlannerService {

  private DATE_FORMAT_DD_MMM_YYYY = 'DD-MMM-YYYY'
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


  getRecurrenceRuleForPlan(recurr:any){
    if(!recurr.isRepeat){
      return {
        dates : [moment(recurr.startDate).format(this.DATE_FORMAT_DD_MMM_YYYY)],
        text : `on ${moment(recurr.startDate).format(this.DATE_FORMAT_DD_MMM_YYYY)}`
      }
    }
    
    let startdate = moment(recurr.startDate);
    let enddate = moment().add(1,'years'); //a year from todays date.
    if(recurr.endDate && moment(recurr.endDate).isBefore(enddate)){
      enddate = moment(recurr.endDate);
    }

    let recurrInterval:any = {
      dtstart: datetime(startdate.year(), startdate.month()+1, startdate.date()),
      until: datetime(enddate.year(), enddate.month()+1, enddate.date()),
      interval : recurr.every
    };

    switch (recurr.unit) {
      case 'DAYS':
        recurrInterval.freq = RRule.DAILY;
        break;
        case 'WEEKS':
          recurrInterval.freq = RRule.WEEKLY;
          recurrInterval.byweekday = recurr.weekdays
          break;
        case 'MONTHS':
          recurrInterval.freq = RRule.MONTHLY;
          recurrInterval.bymonthday = recurr.date;
          break;
          case 'YEARS':
            recurrInterval.freq = RRule.YEARLY;
            recurrInterval.bymonth = recurr.months;
            recurrInterval.bymonthday = recurr.date;
        break;
      default:
        break;
    }

    return {
      dates : new RRule(recurrInterval).all().map(dt=>moment(dt).format(this.DATE_FORMAT_DD_MMM_YYYY)),
      text : new RRule(recurrInterval).toText()
    }
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
