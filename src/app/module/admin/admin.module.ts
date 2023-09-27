import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { MasterComponent } from './master/master.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreModule } from 'src/app/core/core.module';
import { DxDataGridModule} from 'devextreme-angular';
import { SafeBoxComponent } from './safe-box/safe-box.component';

@NgModule({
  declarations: [MasterComponent,SafeBoxComponent, AdminComponent],
  imports: [
    CommonModule,
    AdminRoutingModule, 
    SharedModule,
    CoreModule,
    DxDataGridModule
  ]
})
export class AdminModule {}
