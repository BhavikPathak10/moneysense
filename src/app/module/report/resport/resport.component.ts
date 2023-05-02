import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Transaction } from 'src/app/core/models/transaction.model';
import { LedgerStore } from 'src/app/core/stores/ledger.store';
import PivotGridDataSource from "devextreme/ui/pivot_grid/data_source"
import * as moment from 'moment';
import { TransactionStore } from 'src/app/core/stores/transaction.store';

@Component({
  selector: 'app-resport',
  templateUrl: './resport.component.html',
  styleUrls: ['./resport.component.scss'],
})
export class ResportComponent implements OnInit {

  subscription: Subscription[] = [];
  ledgerDetails : Transaction[] = [];

  reportSelected: boolean = true;

  pivotDataSource : PivotGridDataSource = new PivotGridDataSource();

  constructor(private ledgerStore : LedgerStore,private transactionStore : TransactionStore) {
    this.subscription.push(
      /* this.ledgerStore.bindStore().subscribe((data)=>{
        this.ledgerDetails = data;
      }), */
      this.transactionStore.bindStore().subscribe((data)=>{
        this.ledgerDetails = data;
      })
    );
  }

  ngOnInit(): void {
    this.pivotDataSource = new PivotGridDataSource({
      fields:[
        {area:'row',dataField:'accountHead',expanded:true},
        {area:'row',dataField:'particular',caption:'Ledger'},
        {area:'filter',dataField:'groupHead'},
        {area:'filter',dataField:'subHead'},
        {area:'filter',dataField:'accountHead'},
        {area:'filter',dataField:'particular',caption:'Ledger'},
        {area:'filter',dataField:'costCenter'},
        {area:'filter',dataField:'costCategory'},
        {area:'filter',dataField:'accountName',caption:'Bank'},
        {area:'column',dataField:'transactionDate',dataType:"date",groupName:'Date'},
        { groupName: "Date", groupInterval: "year", groupIndex: 0 },
        { groupName: "Date", groupInterval: "month", groupIndex: 1 },
        {area:'data',dataField:'withdrawal',dataType:'number',summaryType: 'sum',caption:'Withdraw',format: "₹ ,##0.##"},
        {area:'data',dataField:'deposit',dataType:"number", summaryType: 'sum',caption:'Deposit',format: "₹ ,##0.##"}
        ],
      store:this.ledgerDetails
    })
  }

  getFileName(){
    return 'MoneySense_Report_'+moment().format("Do_MMM_YYYY");
  }

  ngOnDestory() {
    this.subscription.map((sub) => sub.unsubscribe());
  }
}
