import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import * as moment from 'moment';

import { Subscription } from 'rxjs';
import { MY_DATE_FORMATS } from 'src/app/core/constants/dateFormat.constant';
import { PlannerService } from 'src/app/core/services/planner.service';
import { PlannerStore } from 'src/app/core/stores/planner.store';

@Component({
  selector: 'app-planner-calendar',
  templateUrl: './planner-calendar.component.html',
  styleUrls: ['./planner-calendar.component.scss']
})
export class PlannerCalendarComponent implements OnInit,AfterViewInit {

  DATE_FORMAT_DD_MMM_YYYY = 'DD-MMM-YYYY'

  subscription:Subscription[] = [];
  planners = [];
  planSchedule:any = [];

  periods: string[] = ['Month','Week'];
  groupBy = new FormControl(this.periods);

  @ViewChild("dxDataPlannerGrid", { static: false }) dataGrid?: DxDataGridComponent;

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
    this.groupBy.valueChanges.subscribe((data)=>{
      if(data.includes('Month')){
        this.dataGrid?.instance.columnOption('Month','groupIndex',1)
      }else{
        this.dataGrid?.instance.columnOption('Month','groupIndex',false)
      }

      if(data.includes('Week')){
        this.dataGrid?.instance.columnOption('Week','groupIndex',2)
      }else{
        this.dataGrid?.instance.columnOption('Week','groupIndex',false)
      }

    })
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    let filterValue = [
      new Date(new Date().getFullYear(), 0, 1), 
      new Date(new Date().getFullYear(), 11, 31)
    ];

     this.dataGrid?.instance.columnOption('taskdate', 'filterValue', filterValue);
     this.dataGrid?.instance.columnOption('taskdate', 'selectedFilterOperation', 'between');

     this.dataGrid?.instance.refresh();
  }

  generateGrid(){
    let arr:any = [];
    this.planners.forEach((t:any)=>{
    let flatArr = t.recurrenceDates.map((dt:any)=>{
        return {
            taskdate: moment(new Date(dt)).format('YYYY/MM/DD'),
            month : moment(new Date(dt)).set('date',1).format('YYYY/MM/DD'),
            year :moment(new Date(dt)).format('YYYY'),
            //week : moment(new Date(dt)).isoWeek(),
            week : this.getWeekOfMonth(new Date(dt)),
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

  markAsDone(e:any){
    console.log(e);
    e.event.preventDefault();
  }
  
  markAsIgnore(e:any){
    console.log(e);
    e.event.preventDefault();
    e.row.cells.forEach((cell:any)=>{
      cell.cellElement.classList.remove('lapsed');
      cell.cellElement.classList.add('strike');
    })
  }

  private getWeekOfMonth(d:Date){
    let dateNumber = d.getDate();
    if(dateNumber >= 1 && dateNumber <= 7){
      return 1
    }
    if(dateNumber >= 8 && dateNumber <= 14){
      return 2
    }
    if(dateNumber >= 15 && dateNumber <= 21){
      return 3
    }
    if(dateNumber >= 22 && dateNumber <= 28){
      return 4
    }
    return 5;
  }

  ngOnDestroy(){
    this.subscription.map((sub)=>sub.unsubscribe());
  }

}
