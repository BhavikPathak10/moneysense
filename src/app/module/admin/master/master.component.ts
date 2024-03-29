import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Master } from 'src/app/core/enums/master.enum';
import { MasterService } from 'src/app/core/services/master.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { MasterStore } from 'src/app/core/stores/master.store';
import { DxDataGridComponent } from "devextreme-angular";
import { TransactionService } from 'src/app/core/services/transaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
  host: {
    //class: 'flexColumn',
  },
})
export class MasterComponent implements OnInit {
  subscription: Subscription[] = [];
  masterDetails: any = [];
  _masterDetails: any = [];
  MASTER = Master;
  backToBank:string = ''; 

  groupHeadOptions : Array<any> =[];
  subHeadOptions: Array<any> =[];
  accountHeadOptions: Array<any> =[];
  ledgerOptions: Array<any> =[];
  costCenterOptions: Array<any> =[];
  costCategoryOptions: Array<any> =[];
  
  focusedRowKey:any ='';
  @ViewChild(DxDataGridComponent,{static:false}) dataGrid?: DxDataGridComponent;

  constructor(
    private router : Router,
    private masterStore: MasterStore,
    private masterService: MasterService,
    private toast: ToastMessageService,
    private transactionService : TransactionService
  ) {

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

        this._masterDetails = JSON.parse(JSON.stringify(this.masterDetails));
        this.groupHeadOptions = [...new Set(this.masterDetails.map((x:any)=>x['groupHead']))];
        this.subHeadOptions = [...new Set(this.masterDetails.map((x:any)=>x['subHead']))];
        this.accountHeadOptions = [...new Set(this.masterDetails.map((x:any)=>x['accountHead']))];
        this.ledgerOptions = [...new Set(this.masterDetails.map((x:any)=>x['ledger']))];
        this.costCenterOptions = [...new Set(this.masterDetails.map((x:any)=>x['costCenter']))];
        this.costCategoryOptions = [...new Set(this.masterDetails.map((x:any)=>x['costCategory']))];
      }),
      this.transactionService.returnBank$.subscribe((data)=>{
        this.backToBank = data;
      })
    );
  }

  ngOnInit(): void {}

  private _filter(value: string, arrayList:Array<any>): any {
    const filterValue = value?.toLowerCase();
    return arrayList?.filter((option: any) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  routeToBank(){
    this.router.navigate(['home','bank',this.backToBank]);
    this.transactionService.returnBank$.next('');
  }

  saveMaster(e:any){
    let data = e.changes[0].data || e.changes[0].key;
    this.onSaveMasterDetails(e.changes[0].type,data).subscribe((data)=>{
      this.toast.success(`Master details ${e.changes[0].type} successful`,'close');
      this.masterService.syncStore();
    },(err)=>{
      this.toast.alert('Some error occured, Please try again later.','close');
    });
  }

  onSaveMasterDetails(type:string,data:any):Observable<any>{
    let obs=new Observable();
    switch (type) {
      case 'insert':
        let _data = this.getMasterData(data);
        if(_data && _data.id){
          this.focusedRowKey = this.dataGrid?.instance.keyOf(_data);
          this.toast.info('Master Details already available at highlighted row.', 'close');
        }else{
          obs = this.masterService.addMasterData(_data);
        }
        break;
      case 'remove':
        obs = this.masterService.deleteMaster(data);
      break;
      default:
      break;
    }
    return obs;
  }

  getMasterData(data:any){

    let obj = {
      'Group Head': data['groupHead'].toUpperCase(),
      'Sub Head': data['subHead'].toUpperCase(),
      'Account Head': data['accountHead'].toUpperCase(),
      Ledger: data['ledger'].toUpperCase(),
      'Cost Center': data['costCenter'].toUpperCase(),
      'Cost Category': data['costCategory'].toUpperCase(),
    };

    let detailsAvail = this._masterDetails.find((rec:any)=> rec.ledger.toLowerCase() == data['ledger'].toLowerCase()) || this._masterDetails.find((rec:any)=> rec.groupHead.toLowerCase() == data['groupHead'].toLowerCase() 
    && rec.subHead.toLowerCase() == data['subHead'].toLowerCase() 
    && rec.accountHead.toLowerCase() == data['accountHead'].toLowerCase() 
    && rec.ledger.toLowerCase() == data['ledger'].toLowerCase() 
    && rec.costCenter.toLowerCase() == data['costCenter'].toLowerCase() 
    && rec.costCategory.toLowerCase() == data['costCategory'].toLowerCase()); 

    return detailsAvail ? detailsAvail : obj;
  }

  ngOnDestroy() {
    this.subscription.map((sub) => sub.unsubscribe());
  }

}