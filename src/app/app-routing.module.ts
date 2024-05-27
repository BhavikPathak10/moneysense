import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { IncomeAtGlanceComponent } from './module/income-at-glance/income-at-glance.component';
import { OverviewComponent } from './module/overview/overview.component';
import { PendingPaymentComponent } from './module/pending-payment/pending-payment.component';
import { PlannerComponent } from './module/planner/planner.component';
import { HomeComponent } from './shared/component/home/home.component';
import { LoginComponent } from './shared/component/login/login.component';
import { PageNotFoundComponent } from './shared/component/page-not-found/page-not-found.component';
import { ProfileComponent } from './shared/component/profile/profile.component';
import { VerifyEmailComponent } from './shared/component/verify-email/verify-email.component';

const routes: Routes = [
  {
    path:'auth',
    children:[{
      path:'login',
      component:LoginComponent
    },{
      path:'verify-email',
      component:VerifyEmailComponent
    },{
      path:'**',
      redirectTo:'login'
    }]
  },
  {
    path:'home',
    component:HomeComponent,
    canActivate:[AuthGuard],
    children:[
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
      {
        path: 'planner',
        component: PlannerComponent,
      },
      /* {
        path:'profile',
        component:ProfileComponent
      }, */
      {
        path: '**',
        redirectTo:'overview'
      },
    ]
  },
  {
    path:'page-not-found',
    component:PageNotFoundComponent
  },
  {
    path:'',
    redirectTo:'auth',
    pathMatch:'full'
  },
  {
    path:'**',
    redirectTo:'auth',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthGuard]
})
export class AppRoutingModule {}
