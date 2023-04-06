import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { Master } from 'src/app/core/enums/master.enum';
import { MasterService } from 'src/app/core/services/master.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { MasterStore } from 'src/app/core/stores/master.store';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';
import { DxDataGridComponent } from "devextreme-angular";

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
  host: {
    class: 'flexColumn',
  },
})
export class MasterComponent implements OnInit {
  subscription: Subscription[] = [];
  masterDetails: any = [];
  MASTER = Master;

  groupHeadOptions : Array<any> =[];
  subHeadOptions: Array<any> =[];
  accountHeadOptions: Array<any> =[];
  ledgerOptions: Array<any> =[];
  costCenterOptions: Array<any> =[];
  costCategoryOptions: Array<any> =[];
  
  filter_groupHeadOptions: Observable<any[]> | undefined;
  filter_subHeadOptions: Observable<any[]> | undefined;
  filter_accountHeadOptions: Observable<any[]> | undefined;
  filter_ledgerOptions: Observable<any[]> | undefined;
  filter_costCenterOptions: Observable<any[]> | undefined;
  filter_costCategoryOptions: Observable<any[]> | undefined;

  focusedRowKey:any ='';
  @ViewChild(DxDataGridComponent,{static:false}) dataGrid?: DxDataGridComponent;

  displayedColumns = [
    'groupHead',
    'subHead',
    'accountHead',
    'ledger',
    'costCenter',
    'costCategory',
    'action',
  ];
  masterForm = new FormGroup({
    groupHead: new FormControl(null, Validators.required),
    subHead: new FormControl(null, Validators.required),
    accountHead: new FormControl(null, Validators.required),
    ledger: new FormControl(null, Validators.required),
    costCenter: new FormControl(null, Validators.required),
    costCategory: new FormControl(null, Validators.required),
  });

  constructor(
    private masterStore: MasterStore,
    private masterService: MasterService,
    private toast: ToastMessageService,
    private dialog: MatDialog
  ) {

    this.onDeleteMasterDx = this.onDeleteMasterDx.bind(this);

    this.subscription.push(
      this.masterStore.bindStore().subscribe((data) => {
        this.masterDetails = data?.map((d: any) => {
          return {
            groupHead: d[this.MASTER.GROUP_HEAD],
            subHead: d[this.MASTER.SUB_HEAD],
            accountHead: d[this.MASTER.ACCOUNT_HEAD],
            ledger: d[this.MASTER.LEDGER],
            costCenter: d[this.MASTER.COST_CENTER],
            costCategory: d[this.MASTER.COST_CATEGORY],
            id: d['id'],
          };
        });
        this.groupHeadOptions = [...new Set(this.masterDetails.map((x:any)=>x['groupHead']))];
        this.subHeadOptions = [...new Set(this.masterDetails.map((x:any)=>x['subHead']))];
        this.accountHeadOptions = [...new Set(this.masterDetails.map((x:any)=>x['accountHead']))];
        this.ledgerOptions = [...new Set(this.masterDetails.map((x:any)=>x['ledger']))];
        this.costCenterOptions = [...new Set(this.masterDetails.map((x:any)=>x['costCenter']))];
        this.costCategoryOptions = [...new Set(this.masterDetails.map((x:any)=>x['costCategory']))];
      })
    );
  }

  ngOnInit(): void {
    this.filter_groupHeadOptions = this.masterForm.get('groupHead')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value,this.groupHeadOptions))
    );
    this.filter_subHeadOptions = this.masterForm.get('subHead')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value,this.subHeadOptions))
    );
    this.filter_accountHeadOptions = this.masterForm.get('accountHead')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value,this.accountHeadOptions))
    );
    this.filter_ledgerOptions = this.masterForm.get('ledger')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value,this.ledgerOptions))
    );
    this.filter_costCenterOptions = this.masterForm.get('costCenter')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value,this.costCenterOptions))
    );
    this.filter_costCategoryOptions = this.masterForm.get('costCategory')?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value,this.costCategoryOptions))
    );
  }

  private _filter(value: string, arrayList:Array<any>): any {
    const filterValue = value?.toLowerCase();
    return arrayList?.filter((option: any) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  onAddMaster(formDirective:FormGroupDirective) {
    if (this.masterForm.valid) {
      let formValue = this.masterForm.value;
      let obj = {
        'Group Head': formValue['groupHead'].toUpperCase(),
        'Sub Head': formValue['subHead'].toUpperCase(),
        'Account Head': formValue['accountHead'].toUpperCase(),
        Ledger: formValue['ledger'].toUpperCase(),
        'Cost Center': formValue['costCenter'].toUpperCase(),
        'Cost Category': formValue['costCategory'].toUpperCase(),
      };


      let detailsAvail = this.masterDetails.find((rec:any)=> rec.ledger.toLowerCase() == formValue['ledger'].toLowerCase()) || this.masterDetails.find((rec:any)=> rec.groupHead.toLowerCase() == formValue['groupHead'].toLowerCase() 
      && rec.subHead.toLowerCase() == formValue['subHead'].toLowerCase() 
      && rec.accountHead.toLowerCase() == formValue['accountHead'].toLowerCase() 
      && rec.ledger.toLowerCase() == formValue['ledger'].toLowerCase() 
      && rec.costCenter.toLowerCase() == formValue['costCenter'].toLowerCase() 
      && rec.costCategory.toLowerCase() == formValue['costCategory'].toLowerCase());

      if(detailsAvail){
        this.focusedRowKey = this.dataGrid?.instance.keyOf(detailsAvail);
        this.toast.info('Master Details already available at highlighted row.', 'close');
        return;
      }

      this.masterService.addMasterData(obj).subscribe(
        (data) => {
          this.masterService.syncStore();
          formDirective.resetForm();
          this.masterForm.reset();
          this.toast.success('Master Details added successfully.', 'close');
        },
        (err) => {
          this.toast.warning(
            'Some error occured. Please try again later.',
            'close'
          );
        }
      );
    }
  }

  onDeleteMasterDx(e?:any){
    if(e && e.row && e.row.data){
      this.onDeleteMaster(e.row.data.id);
    }
  }

  onDeleteMaster(rowId: any) {
    let deleteConfirmed = () => {
      this.masterService.deleteMaster(rowId).subscribe(
        (data) => {
          this.masterService.syncStore();
          this.toast.success('Master detail deleted successfully.', 'close');
        },
        (err) => {
          this.toast.success(
            'Some error occured. Please try again later.',
            'close'
          );
        }
      );
    };

    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: 'Yes',
        cancelButtonText: 'No',
        hideCancel: 'no',
        title: 'Delete master detail',
        message: `Are you sure you want to delete Master detail?`,
      },
    };

    const dialog = this.dialog?.open(ConfirmDialogComponent, dialogObj);

    dialog?.afterClosed().subscribe((result) => {
      if (result) {
        deleteConfirmed();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.map((sub) => sub.unsubscribe());
  }

}