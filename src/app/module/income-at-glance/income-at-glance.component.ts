import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { IncomeAtGlanceModel } from 'src/app/core/models/incomeAtGlance.model';
import { IncomeService } from 'src/app/core/services/income.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { IncomeAtGlanceStore } from 'src/app/core/stores/incomeAtGlance.store';

@Component({
  selector: 'app-income-at-glance',
  templateUrl: './income-at-glance.component.html',
  styleUrls: ['./income-at-glance.component.scss']
})
export class IncomeAtGlanceComponent implements OnInit {

  subscription:Subscription[] = [];

  incomeDetails:IncomeAtGlanceModel[] = [];
  banks:[] =[];

  constructor(private incomeStore:IncomeAtGlanceStore, private incomeService : IncomeService,private bankStore: BankDetailsStore, private toast :ToastMessageService) {
    this.subscription.push(
      this.incomeStore.bindStore().subscribe((data)=>{
        this.incomeDetails = data;
      }),
      this.bankStore.bindStore().subscribe((data)=>{
        this.banks = data.map((d:BankDetails)=>d.accountName)
      })
    )
   }

  ngOnInit(): void {
  }
    
  saveIncome(e:any){
    let computedData = this.incomeService.calcComputedData(e.changes[0].data || e.changes[0].key);
    this.onSaveIncomeDetails(e.changes[0].type,computedData).subscribe((data)=>{
      this.toast.success(`Income ${e.changes[0].type} successful`,'close');
      this.incomeService.syncStore();
    },(err)=>{
      this.toast.alert('Some error occured, Please try again later.','close');
    });
  }

  onSaveIncomeDetails(type:string,data:any):Observable<any>{
    let obs=new Observable();
    switch (type) {
      case 'insert':
        obs = this.incomeService.addIncomeAtGlance(data);
        break;
        case 'remove':
          obs = this.incomeService.deleteIncomeAtGlance(data.id);
          break;
          case 'update':
            obs = this.incomeService.updateIncomeAtGlanceDetails(data);
        break;
        default:
        break;
    }
    return obs;
  }

}
