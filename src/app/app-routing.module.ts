import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminModule } from './module/admin/admin.module';
import { IncomeAtGlanceComponent } from './module/income-at-glance/income-at-glance.component';
import { OverviewComponent } from './module/overview/overview.component';
import { PendingPaymentComponent } from './module/pending-payment/pending-payment.component';
const routes: Routes = [
  {
    path: 'overview',
    component: OverviewComponent,
  },
  {
    path: 'bank',
    loadChildren: () =>
      import('./module/bank-details/bank-details.module').then(
        (m) => m.BankDetailsModule
      ),
  },
  {
    path: 'report',
    loadChildren: () =>
      import('./module/report/report.module').then((m) => m.ReportModule),
  },
  {
    path: 'income-at-glance',
    component: IncomeAtGlanceComponent,
  },
  {
    path: 'pending-payment',
    component: PendingPaymentComponent,
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./module/admin/admin.module').then((m) => m.AdminModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
