import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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
import { PlannerService } from './planner.service';
import { TokenStorageService } from './token-storage.service';
import { TransactionService } from './transaction.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(
    private bankService: BankService,
    private transactionService: TransactionService,
    private masterService: MasterService,
    private ledgerService : LedgerServiceService,
    private incomeService : IncomeService,
    private pendingPayemntService : PendingPaymentService,
    private plannerService : PlannerService,
   ) {}

  initApp() {
    combineLatest({
     transaction : this.transactionService.getTransactionDetails(),
     bank : this.bankService.getBankDetails(),
     master: this.masterService.getMasterDetails(),
     incomeAtGlance : this.incomeService.getIncomeAtGlanceDetails(),
     pendingPayment : this.pendingPayemntService.getPendingPaymentDetails(),
     plannerService : this.plannerService.getPlannerDetails()
    }).subscribe((data)=>{
       this.transactionService.syncStore(data.transaction);
       this.bankService.syncStore(data.bank);
       this.masterService.syncStore(data.master);
       this.incomeService.syncStore(data.incomeAtGlance);
       this.pendingPayemntService.syncStore(data.pendingPayment);
       this.plannerService.syncStore(data.plannerService);
       this.ledgerService.setLedgerDetails();
    })
  }
}
