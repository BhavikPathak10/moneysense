import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Master } from '../enums/master.enum';
import { Transaction } from '../models/transaction.model';
import { LedgerStore } from '../stores/ledger.store';
import { MasterStore } from '../stores/master.store';
import { TransactionStore } from '../stores/transaction.store';

@Injectable({
  providedIn: 'root'
})
export class LedgerServiceService {
  private MASTER = Master;
  
  private transactions : Transaction[] = [];
  private master : [] = [];

  private ledgerData: Transaction[] = [];

  constructor(private transactionStore : TransactionStore,private masterStore : MasterStore,private ledgerStore : LedgerStore) {
    this.transactionStore.bindStore().subscribe((data:Transaction[])=>{
      this.transactions = data;
      this.setLedgerDetails();
    });
    this.masterStore.bindStore().subscribe((data)=>{
      this.master = data;
    });
   }

   setLedgerDetails() {
     this.ledgerData = [];
     this.transactions.forEach(t=>this.addLedgerDetails(t));
     this.ledgerStore.setStore(this.ledgerData);
   }

   addLedgerDetails(data:Transaction){
     data.accountHead = '';
     data.groupHead = '';
     data.subHead = '';
     data.costCenter = '';
     data.costCategory = '';
     
     let _master = this.master.find((m)=>m[this.MASTER.LEDGER] === data.particular);
     if(_master){
      data.accountHead = _master[this.MASTER.ACCOUNT_HEAD];
      data.groupHead = _master[this.MASTER.GROUP_HEAD];
      data.subHead = _master[this.MASTER.SUB_HEAD];
      data.costCenter = _master[this.MASTER.COST_CENTER];
      data.costCategory = _master[this.MASTER.COST_CATEGORY];
      }
      this.ledgerData.push(data);
   }

   removeLedgerDetails(id:any){
    this.ledgerData = this.ledgerData.filter(data=>data.id!=id);
    this.ledgerStore.setStore(this.ledgerData);
  }

}