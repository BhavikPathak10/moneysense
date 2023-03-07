import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ResportComponent } from './resport/resport.component';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';
import { DxDataGridModule,DxPivotGridModule } from 'devextreme-angular';

@NgModule({
  declarations: [ResportComponent, ReportComponent],
  imports: [CommonModule, SharedModule, ReportRoutingModule,DxDataGridModule,DxPivotGridModule],
})
export class ReportModule {}
