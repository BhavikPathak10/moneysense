import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { BankService } from 'src/app/core/services/bank.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { AddBankDialogComponent } from '../add-bank-dialog/add-bank-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidenavComponent implements OnInit {
  title: string = 'MoneySense';
  banks: BankDetails[] = [];

  subscriptions: Subscription[] = [];
  currentRouteActive : boolean = false;

  constructor(
    public dialog: MatDialog,
    private bankService: BankService,
    private bankStore: BankDetailsStore,
    private router: Router,
    private route: ActivatedRoute,
    private transactionservice: TransactionService,
    private excelService :  ExcelService,
    private toast: ToastMessageService,
    private auth : AuthService,
  ) {
    this.subscriptions.push(
      this.bankStore.bindStore().subscribe((data) => {
        this.banks = data;
        if (this.banks.length < 1) {
          this.openAddBankDetails(undefined, true);
        }
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
            console.log(err);
            this.toast.warning(
              `Some error occured. Please try again later.`,
              'close'
            );
          }
        );
      }
    });
  }

  editBank(event? : any, bankdata? : any){
    event && event.stopPropagation();

    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: { isOnboarding: false, bankdata : bankdata },
    };

    const bankDialog = this.dialog.open(AddBankDialogComponent, dialogObj);

    bankDialog.afterClosed().subscribe((result: BankDetails) => {
      if (result) {
        this.bankService.updateBankDetails(result)?.subscribe(
          (data) => {
            this.bankService.syncStore();
            this.router.navigate(['bank', result.accountName], {
              relativeTo: this.route,
            });
            this.toast.success(
              `${result.accountName} Bank updated successfull`,
              'close'
            );
          },
          (err) => {
            console.log(err);
            this.toast.warning(
              `Some error occured. Please try again later.`,
              'close'
            );
          }
        )
      }
    })

  }

  deleteBank(event: any, bank: BankDetails) {
    event.stopPropagation();

    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: 'Yes',
        cancelButtonText: 'No',
        hideCancel: 'no',
        title: 'Delete Bank',
        message: `Are you sure you want to delete ${bank.accountName} and its transactions?`,
      },
    };

    const bankDialog = this.dialog.open(ConfirmDialogComponent, dialogObj);

    bankDialog.afterClosed().subscribe((result: BankDetails) => {
      if (result) {
        this.transactionservice.deleteBankTransaction(bank);
        //this.bankService.syncStore();
        //this.bankStore.setStore(this.banks.filter((b) => b.id != bank.id));
        this.toast.success(
          `Bank ${bank.accountName} deleted successfully.`,
          'close'
        );
        //this.navigateTo()
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
    this.auth.logout();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((sub) => sub.unsubscribe());
  }
}
