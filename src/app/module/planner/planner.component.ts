import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { PlannerService } from 'src/app/core/services/planner.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { Subscription } from 'rxjs';
import { PlannerStore } from 'src/app/core/stores/planner.store';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit {

  _weekdays = ['Mo','Tu','We','Th','Fr','Sa','Su'].map((w,i)=>{return {name :w,value:i}});
  _months = moment.monthsShort().map((m,i)=>{ return {name:m,value:i+1}});

  subscription : Subscription[] = [];
  planner:any = [];
  showPlanner = false;
  isActivePlan:any = false;

  taskNametFormGroup = this._formBuilder.group({
    taskName: ['',Validators.required],
    taskEstBudget : ['',Validators.required]
  });
  scheduleFormGroup = this._formBuilder.group({
    isRepeat :[false,Validators.required],
    every: [1],
    unit: ['DAYS'],
    weekdays:[],
    months :[],
    date:[],
    startDate: [new Date(), Validators.required],
    endDate: [],
  });
  thirdFormGroup = this._formBuilder.group({
    //secondCtrl: ['', Validators.required],
  });

  constructor(
    private _formBuilder : FormBuilder, 
    private plannerStore : PlannerStore, 
    private plannerService : PlannerService, 
    private toast : ToastMessageService,
    private dialog:MatDialog
    ) {
    this.subscription.push(
      this.plannerStore.bindStore().subscribe((data)=>{
        this.planner = data.map((d:any)=>{
          d.recurText = this.plannerService.getRecurrenceRuleForPlan(d.taskRecurrence).text
          return d;
        });

      })
    );
  }

  ngOnInit(): void {
  }

  onPlanAddorUpdate(){
    let taskNameForm = this.taskNametFormGroup.value;
    let taskDetails = {
      taskName: taskNameForm.taskName,
      taskEstBudget: taskNameForm.taskEstBudget,
      taskRecurrence: {
        isRepeat :this.scheduleFormGroup.value['isRepeat'],
        every: this.scheduleFormGroup.value['every'],
        unit: this.scheduleFormGroup.value['unit'],
        weekdays:this.scheduleFormGroup.value['weekdays'],
        months :this.scheduleFormGroup.value['months'],
        date:this.scheduleFormGroup.value['date'],
        startDate:this.scheduleFormGroup.value['startDate'],
        endDate:this.scheduleFormGroup.value['endDate']
      },
      /* PaymentDetails: {},
      completedDates: [],
      lapsedDates: [] */
    };

    this.AddOrUpdatePlan(taskDetails).subscribe((data)=>{
      this.toast.success(`Plan ${taskDetails.taskName} ${this.isActivePlan ? 'updated': 'added'} successfully.`,'close');
      this.plannerService.syncStore();
      this.showPlanner = false;
      this.isActivePlan = false;
    },err=>{
      this.toast.warning(`Something went wrong, Please try again.`,'close');
    })
  }

  AddOrUpdatePlan(plan:any){
    let backendCall = null;
    if(this.isActivePlan){
      backendCall = this.plannerService.updatePlannerData({...plan,id:this.isActivePlan.id});
    }else{
      backendCall = this.plannerService.addPlannerData({...plan});
    }
    return backendCall;
  }

  editPlanner(plan:any){
    this.showPlanner = true;
    this.isActivePlan = plan;

    this.taskNametFormGroup.setValue({
      taskName: plan?.taskName,
      taskEstBudget : plan?.taskEstBudget
    });

    let scheduleObj = {
      isRepeat :plan.taskRecurrence['isRepeat'],
      every: plan.taskRecurrence['every'] ? plan.taskRecurrence['every'] : null,
      unit: plan.taskRecurrence['unit'] ? plan.taskRecurrence['unit'] : null,
      weekdays:plan.taskRecurrence['weekdays'] ? plan.taskRecurrence['weekdays'] : null,
      months :plan.taskRecurrence['months'] ? plan.taskRecurrence['months'] : null,
      date:plan.taskRecurrence['date'] ? plan.taskRecurrence['date'] : null,
      startDate:plan.taskRecurrence['startDate'] ? plan.taskRecurrence['startDate'] : null,
      endDate:plan.taskRecurrence['endDate'] ? plan.taskRecurrence['endDate'] : null
    };

    this.scheduleFormGroup.setValue(scheduleObj);    
  }

  deletePlanner(plan:any){
    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        title: 'Confirm delete',
        message: `Are you sure you want to delete ${plan.taskName} and its recurrences?`,
        okButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        hideCancel: 'no',
    }}

    const dialogRef = this.dialog.open(ConfirmDialogComponent,dialogObj);

    dialogRef.afterClosed().subscribe((result)=>{
      if(result){
        this.plannerService.deletePlanner(plan.id).subscribe((data)=>{
          this.toast.success(`Plan ${plan.taskName} deleted successfully.`,'close');
          this.plannerService.syncStore();
        },err=>{
          this.toast.warning(`Something went wrong, Please try again.`,'close');
        })
      }
    })
  }

  onTogglePlanner(){
    this.showPlanner = !this.showPlanner;
    this.isActivePlan = false;
    this.scheduleFormGroup.reset({startDate:moment(),every:1,unit:'DAYS',isRepeat:false});
    this.taskNametFormGroup.reset();
  }

  ngOnDestroy():void{
    this.subscription.map(sub=>sub.unsubscribe());
  }

}