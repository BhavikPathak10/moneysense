import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { BankService } from 'src/app/core/services/bank.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { ResponsiveService } from 'src/app/core/services/responsive.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { AddBankDialogComponent } from '../add-bank-dialog/add-bank-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  host:{
    class:'fullWidth'
  }
})
export class SidenavComponent implements OnInit {
  title: string = 'MoneySense';
  banks: BankDetails[] = [];
  bankMenuOpen = false;
  showRoutes = false;

  subscriptions: Subscription[] = [];
  currentRouteActive : boolean = false;
  isTabletOrSmaller : boolean = false;

  constructor(
    public dialog: MatDialog,
    private bankService: BankService,
    private bankStore: BankDetailsStore,
    private router: Router,
    private route: ActivatedRoute,
    private excelService :  ExcelService,
    private toast: ToastMessageService,
    private auth : AuthService,
    private responsive : ResponsiveService
  ) {
    this.subscriptions.push(
      this.bankStore.bindStore().subscribe((data) => {
        this.banks = data;
        if (this.banks.length < 1) {
          this.openAddBankDetails(undefined, true);
        }
      }),
      this.responsive.isTabletOrSmaller$.subscribe((data:any)=>{
        this.isTabletOrSmaller = data;
      })
    );
  }

  ngOnInit(): void {
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.currentRouteActive = evt.url.includes('/bank/');
      }
    });
  }

  toggleRoutes(){
    this.showRoutes = !this.showRoutes;
  }

  openAddBankDetails(event?: any, forceAdd?: boolean) {
    event && event?.stopPropagation();

    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: { isOnboarding: forceAdd },
    };

    const bankDialog = this.dialog.open(AddBankDialogComponent, dialogObj);

    bankDialog.afterClosed().subscribe((result: BankDetails) => {
      if (result) {
        if (result.currentBalance) {
          result.balanceUpdatedAt = new Date().valueOf();
          result.totalDeposit = 0;
          result.totalWithdrawn = 0;
        }
        this.bankService.addBank(result).subscribe(
          (data) => {
            this.bankService.syncStore();
            //this.banks.push(data);
            this.router.navigate(['bank', result.accountName], {
              relativeTo: this.route,
            });
            this.toast.success(
              `${result.accountName} Bank added successfull`,
              'close'
            );
          },
          (err) => {
            this.toast.warning(
              `Some error occured. Please try again later.`,
              'close'
            );
          }
        );
      }
    });
  }

  navigateTo(){
    if(this.banks.length > 0){
      this.router.navigate(['overview'], {
        relativeTo: this.route,
      });
    }
  }

  downloadBackup(){
    this.excelService.exportAllDetails();
  }

  logout(){
    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        title: 'Confirm logout',
        message: 'Are you sure you want to log out?',
        hint: "Your session will be closed and you'll need to log in again to access your account.",
        okButtonText: 'Logout',
        cancelButtonText: 'Cancel',
        hideCancel: 'no',
        icon: 'power_settings_new'
    }}

    const dialogRef = this.dialog.open(ConfirmDialogComponent,dialogObj);

    dialogRef.afterClosed().subscribe((result)=>{
      if(result){
        this.auth.logout();
      }
    })
  }

  isRouteActive(url:string) {
   return this.router.url.includes(url);
  }

  navigateToBank(accName:any){
    this.router.navigate(['home','bank',accName]);
  }

  userProfile(){
    this.router.navigate(['home','profile']);
  }

  ngOnDestroy(): void {
    this.subscriptions.map((sub) => sub.unsubscribe());
  }
}
