import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionComponent } from './transaction/transaction.component';
import { PassbookComponent } from './passbook/passbook.component';
import { BankDetailsComponent } from './bank-details.component';
import { BankDetailsRoutingModule } from './bank-details-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  declarations: [TransactionComponent, PassbookComponent, BankDetailsComponent],
  imports: [CommonModule, BankDetailsRoutingModule, SharedModule, CoreModule],
})
export class BankDetailsModule {}
