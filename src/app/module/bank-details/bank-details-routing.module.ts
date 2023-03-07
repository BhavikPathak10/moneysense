import { NgModule } from '@angular/core';
import { RouterModule, Routes, ROUTES } from '@angular/router';
import { BankDetailsComponent } from './bank-details.component';

const routes: Routes = [
  {
    path: ':bank_accountName',
    component: BankDetailsComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankDetailsRoutingModule {}
