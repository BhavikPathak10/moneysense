import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { IncomeAtGlanceComponent } from './module/income-at-glance/income-at-glance.component';
import { PendingPaymentComponent } from './module/pending-payment/pending-payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/interceptor/httpconfig.interceptor';
import { OverviewComponent } from './module/overview/overview.component';
import { DxDataGridModule } from 'devextreme-angular';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { PlannerComponent } from './module/planner/planner.component';
import { PlannerCalendarComponent } from './module/planner-calendar/planner-calendar.component';
import { DxPopoverModule } from 'devextreme-angular';

@NgModule({
  declarations: [
    AppComponent,
    IncomeAtGlanceComponent,
    PendingPaymentComponent,
    OverviewComponent,
    PlannerComponent,
    PlannerCalendarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DxDataGridModule,
    DxPopoverModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
