import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { BankDetailsStore } from '../stores/bank.store';
import { IncomeAtGlanceStore } from '../stores/incomeAtGlance.store';
import { MasterStore } from '../stores/master.store';
import { PendingPaymentStore } from '../stores/pendingPayemnt.store';
import { TransactionStore } from '../stores/transaction.store';
import { BankService } from './bank.service';
import { IncomeService } from './income.service';
import { LedgerServiceService } from './ledger-service.service';
import { MasterService } from './master.service';
import { PendingPaymentService } from './pending-payment.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(
    private bankService: BankService,
    private bankStore: BankDetailsStore,
    private transactionService: TransactionService,
    private transactionStore: TransactionStore,
    private masterService: MasterService,
    private masterStore: MasterStore,
    private ledgerService : LedgerServiceService,
    private incomeService : IncomeService,
    private incomeStore : IncomeAtGlanceStore,
    private pendingPaymentStore : PendingPaymentStore,
    private pendingPayemntService : PendingPaymentService,
    private route: Router
  ) {
    this.initApp();
  }

  initApp() {
    combineLatest({
     transaction : this.transactionService.getTransactionDetails(),
     bank : this.bankService.getBankDetails(),
     master: this.masterService.getMasterDetails(),
     incomeAtGlance : this.incomeService.getIncomeAtGlanceDetails(),
     pendingPayment : this.pendingPayemntService.getPendingPaymentDetails()
    }).subscribe((data)=>{
       this.transactionStore.setStore(data.transaction);
       this.bankStore.setStore(data.bank);
       this.masterStore.setStore(data.master);
       this.incomeStore.setStore(data.incomeAtGlance);
       this.pendingPaymentStore.setStore(data.pendingPayment);
       this.ledgerService.setLedgerDetails();
       this.route.navigate(['overview']);
    })
  }
}
