import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { datetime, RRule, RRuleSet, rrulestr } from 'rrule';

import { Subscription } from 'rxjs';
import { PlannerStore } from 'src/app/core/stores/planner.store';

@Component({
  selector: 'app-planner-calendar',
  templateUrl: './planner-calendar.component.html',
  styleUrls: ['./planner-calendar.component.scss']
})
export class PlannerCalendarComponent implements OnInit {

  DATE_FORMAT_DD_MMM_YYYY = 'DD-MMM-YYYY'

  subscription:Subscription[] = [];
  planners = [];
  planSchedule:any = [];

  constructor(
    private plannerStore : PlannerStore
  ) { 
    this.subscription.push(
      this.plannerStore.bindStore().subscribe((data)=>{
        this.planners = data.map((p:any)=>{
          p.recurrenceDates = this.generateReccurence(p.taskRecurrence);
          return p;
         });
         this.generateGrid();
      })
    )
  }

  ngOnInit(): void {
  }

  generateGrid(){
    let arr:any = [];
    this.planners.forEach((t:any)=>{
    let flatArr = t.recurrenceDates.map((dt:any)=>{
        return {
            taskdate: moment(dt).format('YYYY/MM/DD'),
            month : moment(dt).set('date',1).format('YYYY/MM/DD'),
            year :moment(dt).format('YYYY'),
            week : moment(dt).isoWeek(),
            budget:t.taskEstBudget,
            name : t.taskName,
            idx: t.id,
          }
        })
    arr.push(...flatArr);
    })
    this.planSchedule = [...arr];
  }

  generateReccurence(recurr:any){
    if(!recurr.isRepeat){
      return [moment(recurr.startDate).format(this.DATE_FORMAT_DD_MMM_YYYY)];
    }
    
    let startdate = moment(recurr.startDate);
    let enddate = moment().add(1,'years'); //a year from todays date.
    if(recurr.endDate && moment(recurr.endDate).isBefore(enddate)){
      enddate = moment(recurr.endDate);
    }

    let recurrInterval:any = {
      dtstart: datetime(startdate.year(), startdate.month(), startdate.date()),
      until: datetime(enddate.year(), enddate.month(), enddate.date()),
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

    return new RRule(recurrInterval).all().map(dt=>moment(dt).format(this.DATE_FORMAT_DD_MMM_YYYY));
  }

  ngOnDestroy(){
    this.subscription.map((sub)=>sub.unsubscribe());
  }

}
