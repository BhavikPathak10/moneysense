import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './component/sidenav/sidenav.component';
import { CoreModule } from '../core/core.module';
import { RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { AddBankDialogComponent } from './component/add-bank-dialog/add-bank-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './component/confirm-dialog/confirm-dialog.component';
import { HomeComponent } from './component/home/home.component';
import { LoginComponent } from './component/login/login.component';
import { VerifyEmailComponent } from './component/verify-email/verify-email.component';
import { FooterTextComponent } from './component/footer-text/footer-text.component';

@NgModule({
  declarations: [
    SidenavComponent,
    PageNotFoundComponent,
    AddBankDialogComponent,
    ConfirmDialogComponent,
    HomeComponent,
    LoginComponent,
    VerifyEmailComponent,
    FooterTextComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    SidenavComponent,
    CoreModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
  ],
})
export class SharedModule {}
