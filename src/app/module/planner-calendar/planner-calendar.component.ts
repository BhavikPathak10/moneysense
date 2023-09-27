import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DxPopoverComponent } from 'devextreme-angular';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import * as moment from 'moment';

import { Subscription } from 'rxjs';
import { PlannerService } from 'src/app/core/services/planner.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PlannerStore } from 'src/app/core/stores/planner.store';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';
import { ConfirmPlannerDetailsComponent } from 'src/app/shared/component/confirm-planner-details/confirm-planner-details.component';

@Component({
  selector: 'app-planner-calendar',
  templateUrl: './planner-calendar.component.html',
  styleUrls: ['./planner-calendar.component.scss'],
})
export class PlannerCalendarComponent implements OnInit,AfterViewInit {

  DATE_FORMAT_DD_MMM_YYYY = 'DD-MMM-YYYY'

  subscription:Subscription[] = [];
  planners:any = [];
  planSchedule:any = [];
  planScheduleAllData:any = [];

  taskNames :any[] = [];

  transactionDetails : {date?:any, bank?:any, mode?:any, ledger?:any} = {};

  periods: string[] = ['Month','Week'];
  groupBy = new FormControl(this.periods);

  popoverTarget:any;

  appliedFilters : any = null;

  @ViewChild("dxDataPlannerGrid", { static: false }) dataGrid?: DxDataGridComponent;
  @ViewChild("dxPopOver", { static: false }) popOver?: DxPopoverComponent;

  _taskGroup:any;
  get taskGroup(){
    return this._taskGroup;
  }
  @Input ('taskGroup') set taskGroup(value:any){
    this._taskGroup = value;
    this.filterTaskByGrp();
  }

  _taskIgnore:any;
  get taskIgnore(){
    return this._taskIgnore;
  }
  @Input ('taskIgnore') set taskIgnore(value:any){
    this._taskIgnore = value;
    this.filterTaskByGrp();
  }

  constructor(
    private plannerStore : PlannerStore,
    private plannerService : PlannerService,
    private transactionService : TransactionService,
    private toast : ToastMessageService,
    private dialog : MatDialog
  ) {
    this.subscription.push(
      this.plannerStore.bindStore().subscribe((data)=>{
        this.planners = data.map((p:any)=>{
          p.recurrenceDates = this.plannerService.getRecurrenceRuleForPlan(p.taskRecurrence).dates;
          return p;
         });
         this.taskNames = [...new Set(this.planners.map((d:any)=>d.taskName))];
         this.generateGrid();
      }),
      this.plannerService.budgetPlannerFilter$.subscribe((data)=>{
        this.appliedFilters = data;
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

  ngOnInit(): void {}
  
  ngAfterViewInit(): void {
    if(this.appliedFilters){
      //this.dataGrid?.instance.filter(this.appliedFilters);
      this.dataGrid?._setOption('filterValue',this.appliedFilters);
    }else{
      let filterValue = [
        new Date(new Date().getFullYear(), 0, 1), 
        new Date(new Date().getFullYear(), 11, 31)
      ];
      
      this.dataGrid?.instance.columnOption('taskdate', 'filterValue', filterValue);
      this.dataGrid?.instance.columnOption('taskdate', 'selectedFilterOperation', 'between');
    }
    this.dataGrid?.instance.refresh();
  }

  generateGrid(){
    let arr:any = [];
    this.planners.forEach((t:any)=>{
    let flatArr = t.recurrenceDates.map((dt:any)=>{
        let cData = this.getCompletedDetails(t,dt);
        let obj = {
            taskdate: moment(new Date(dt)).format('YYYY/MM/DD'),
            month : moment(new Date(dt)).set('date',1).format('YYYY/MM/DD'),
            year :moment(new Date(dt)).format('YYYY'),
            //week : moment(new Date(dt)).isoWeek(),
            week : this.getWeekOfMonth(new Date(dt)),
            budget:t.taskEstBudget,
            name : t.taskName,
            idx: t.id,
            ignored : this.setIgnoredDetails(t,dt)
          }
          let data:any = {...obj,...cData};
          data.difference = data.budget - (data.transactionAmount ? data.transactionAmount : 0);
          return data;
        })
    arr.push(...flatArr);
    })
    this.planSchedule = [...arr].map((t:any)=>{
      t.taskGroup = 'upcoming';
      if(moment(t.taskdate).isBefore(new Date())){
        t.taskGroup = 'lapsed'
      }
      if(t.hasOwnProperty('transactionId')){
        t.taskGroup = 'completed'
      }
      return t;
    });
    this.planScheduleAllData = [...this.planSchedule];
    this.filterTaskByGrp();
  }

  getCompletedDetails(plan:any,dt:any){
    let date = moment(new Date(dt)).format('YYYY/MM/DD')
    let matchedData = {};
    if(plan.hasOwnProperty('completedDates')){
      let indx = plan.completedDates.map((d:any)=>moment(d.taskdate).format('YYYY/MM/DD')).indexOf(date);
      if(indx>-1){
        matchedData = plan.completedDates[indx];
      }
    }
    return matchedData;
  }

  setIgnoredDetails(plan:any,dt:any){
    let date = moment(new Date(dt)).format('YYYY/MM/DD');
    if(plan.hasOwnProperty('ignoredDates')){
      return plan.ignoredDates.includes(date);
    }
    return false;
  }

  generateReccurence(recurr:any){
   return this.plannerService.getRecurrenceRuleForPlan(recurr).dates;
  }

  onCellPrepared(e:any) {
    if(e.rowType == 'data'){
      if(e.data.taskGroup == 'lapsed'){
        e.cellElement.classList.add('lapsed');
      }
      if(e.data.taskGroup == 'completed'){
        e.cellElement.classList.add('completed');
      }
      if(e.data.ignored){
        e.cellElement.classList.add('strike');
      }
    }
  }

  filterTaskByGrp(){
    if(!this.taskGroup){
      return;
    }
    let filterValue = [...this.taskGroup];
    this.planSchedule = this.planScheduleAllData.filter((t:any)=>{
      if(this.taskIgnore == 'show'){
        return filterValue.includes(t.taskGroup);
      }
      return filterValue.includes(t.taskGroup) && !t.ignored;
    })
  }

  onCellHoverChanged(e:any){
    if (e.rowType === "data" && e.eventType === "mouseover" && e.row.data.hasOwnProperty('transactionId')) {  
      this.transactionDetails = {date : e.row.data.transactionDate , bank : e.row.data.bank, mode : e.row.data.transactionMode, ledger : e.row.data.particular}
      this.popoverTarget = e.cellElement;
      this.popOver?.instance.show();
    }  
    if (e.rowType === "data" && e.eventType === "mouseout") {  
      this.popOver?.instance.hide();  
    }  
  }

  markAsDoneDialog(e:any){
    if(e.row.data.hasOwnProperty('transactionId') && e.row.data.transactionId){
      e.event.preventDefault();
      return;
    }
    e.event.preventDefault();
    let dialogObj = {
      minWidth: 450,
      data: {
        record:e.row.data,
      }
    };

    const dialog = this.dialog?.open(ConfirmPlannerDetailsComponent, dialogObj);
  }

  markAsUndoDialog(e:any){
    e.event.preventDefault();
    let rowData = e.row.data;
    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: 'Undo',
        cancelButtonText: 'Cancel',
        hideCancel: 'no',
        title: 'Undo Payment',
        message: `This action will delete the related transaction from the bank. Are you sure you want to undo payment?`,
      },
    };

    const dialog = this.dialog?.open(ConfirmDialogComponent, dialogObj);

    dialog?.afterClosed().subscribe((result) => {
      if (result) {
        let activePlan = this.planners.find((p:any)=>p.id == rowData.idx);
        activePlan.completedDates.splice(
          activePlan.completedDates.findIndex((cTask:any)=>moment(cTask.taskdate).format('YYYY/MM/DD') == moment(rowData.taskdate).format('YYYY/MM/DD')),
          1);
          if(activePlan.completedDates.length == 0){
            delete activePlan.completedDates;
          }
          this.plannerService.updatePlannerData(activePlan).subscribe(()=>{
            this.plannerService.syncStore();        
            this.transactionService.delete(rowData,'transactionId').subscribe(()=>{
              this.toast.success('This instance of schedule has been reverted successfully.','close');  
              this.transactionService.syncStore();
            });
          })
      }
    });
  }

  markAsIgnoreDialog(e:any){
    e.event.preventDefault();
    let rowData = e.row.data;
    let isUndo = false;
    if(rowData.hasOwnProperty('ignored') && rowData.ignored){
      isUndo = true;
    }

    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: isUndo ? 'Revoke': 'Ignore',
        cancelButtonText: 'Cancel',
        hideCancel: 'no',
        title: `${isUndo ? 'Revoke':'Ignore'} task`,
        message: `Are you sure you want to ${isUndo ? 'revoke' : 'ignore'} ${rowData.name} task on ${moment(rowData.taskdate).format('Do MMM YYYY')} ?`,
      },
    };

    const dialog = this.dialog?.open(ConfirmDialogComponent, dialogObj);

    dialog?.afterClosed().subscribe((result) => {
      if (result) {
        let activePlan = this.planners.find((p:any)=>p.id == rowData.idx);
        if(isUndo){
          if(activePlan.hasOwnProperty('ignoredDates')){
            activePlan.ignoredDates.splice(activePlan.ignoredDates.findIndex((tdate:any)=>moment(tdate).format('YYYY/MM/DD') == moment(rowData.taskdate).format('YYYY/MM/DD')),
            1);
          }
        }else{
          if(activePlan.hasOwnProperty('ignoredDates')){
          activePlan.ignoredDates.push(moment(rowData.taskdate).format('YYYY/MM/DD'))
        }else{
          activePlan.ignoredDates = [(moment(rowData.taskdate).format('YYYY/MM/DD'))];
        }
      }
          this.plannerService.updatePlannerData(activePlan).subscribe(()=>{
            this.plannerService.syncStore();
          });
      }
    });
  }

  isDoneVisible(e:any){
    let row = e.row;
    if(row.rowType == 'data' && (row.data.hasOwnProperty('transactionId') || row.data.ignored)){
      return false;
    }
    return true;
  }

  isIgnoreVisible(e:any){
    return !this.isUndoVisible(e);
  }

  isUndoVisible(e:any){
    let row = e.row;
    if(row.rowType == 'data' && row.data.hasOwnProperty('transactionId')){
      return true;
    }
    return false;
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
    if(this.dataGrid?.filterValue){
      this.plannerService.budgetPlannerFilter$.next(this.dataGrid?.filterValue);
    }
    this.subscription.map((sub)=>sub.unsubscribe());
  }

}
