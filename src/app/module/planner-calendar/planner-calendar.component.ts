import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { Subscription } from 'rxjs';
import { PlannerService } from 'src/app/core/services/planner.service';
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
    private plannerStore : PlannerStore,
    private plannerService : PlannerService
  ) { 
    this.subscription.push(
      this.plannerStore.bindStore().subscribe((data)=>{
        this.planners = data.map((p:any)=>{
          p.recurrenceDates = this.plannerService.getRecurrenceRuleForPlan(p.taskRecurrence).dates;
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
            taskdate: moment(new Date(dt)).format('YYYY/MM/DD'),
            month : moment(new Date(dt)).set('date',1).format('YYYY/MM/DD'),
            year :moment(new Date(dt)).format('YYYY'),
            week : moment(new Date(dt)).isoWeek(),
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
   return this.plannerService.getRecurrenceRuleForPlan(recurr).dates;
  }

  onCellPrepared(e:any) {
    e.cellElement.classList.remove('lapsed');
    if(e.rowType == 'data' && moment(e.data.taskdate).isBefore(new Date())){
      e.cellElement.classList.add('lapsed');
    }
  }

  ngOnDestroy(){
    this.subscription.map((sub)=>sub.unsubscribe());
  }

}
