import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionEnum } from 'src/app/core/enums/transaction.enum';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { Transaction } from 'src/app/core/models/transaction.model';
import { BankService } from 'src/app/core/services/bank.service';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { TransactionStore } from 'src/app/core/stores/transaction.store';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-passbook',
  templateUrl: './passbook.component.html',
  styleUrls: ['./passbook.component.scss'],
  host: {
    class: 'fullHeight fullWidth flexColumn',
  },
})
export class PassbookComponent implements OnInit {
  activeBank: BankDetails | undefined = new BankDetails();
  banks: BankDetails[] = [];
  transactionData: Transaction[] = [];
  bankTransactionData: any = new MatTableDataSource<any>([]);
  subscription: Subscription[] = [];
  activeId: string = '';
  displayedColumns: any = undefined;
  estimatedBalance: number = 0;
  estimatedDeposit: number = 0;
  estimatedWithdrawal: number = 0;
  balanceForm: FormGroup = new FormGroup({
    currentBalance: new FormControl(null),
  });

  transactionEnum = TransactionEnum;

  constructor(
    private route: ActivatedRoute,
    private bankStore: BankDetailsStore,
    private bankService: BankService,
    private transactionStore: TransactionStore,
    private transactionService: TransactionService,
    private dialog: MatDialog,
    private toast: ToastMessageService
  ) {
    this.subscription.push(
      this.route.params.subscribe((param) => {
        this.activeId = param['bank_accountName'];
        if (this.banks.length > 0) {
          this.updateDataByBank();
        }
      }),
      this.bankStore.bindStore().subscribe((data) => {
        this.banks = data;
        if (this.activeId) {
          this.updateDataByBank();
        }
      }),
      this.transactionStore.bindStore().subscribe((data: Transaction[]) => {
        this.transactionData = data.map((x) =>
          new Transaction().deserialize(x)
        );
        this.computeTableData();
      })
    );
  }

  ngOnInit(): void {
    this.displayedColumns = [
      'transactionDate',
      'particular',
      'reference',
      'mode',
      'deposit',
      'withdrawal',
      '_balance',
      'action',
    ];
  }

  ngAfterViewInit() {}

  updateDataByBank() {
    if (this.banks.length > 0) {
      this.activeBank = this.banks.find((b) => b.accountName == this.activeId);
    }
    this.balanceForm
      .get('currentBalance')
      ?.setValue(this.activeBank?.currentBalance);
    this.computeTableData();
  }

  computeTableData() {
    const filterbyBank = this.transactionData.filter(
      (data) => data.accountName == this.activeBank?.accountName
    );
    const sortbyDate = filterbyBank.sort(
      (a, b) =>
        new Date(a.transactionDate).getTime() -
        new Date(b.transactionDate).getTime()
    );
    let prevRecBalance = +this.balanceForm.get('currentBalance')?.value;
    let prevWithdraw = 0;
    let prevDeposit = 0;
    sortbyDate.forEach((rec) => {
      rec._balance = prevRecBalance + rec.deposit - rec.withdrawal;
      prevRecBalance = rec._balance;
      prevDeposit += rec.deposit;
      prevWithdraw += rec.withdrawal;
    });

    this.updateEstimatedBalanceForBank({
      balance: prevRecBalance,
      deposit: prevDeposit,
      withdraw: prevWithdraw,
    });
    this.estimatedBalance = prevRecBalance;
    this.estimatedDeposit = prevDeposit;
    this.estimatedWithdrawal = prevWithdraw;
    this.bankTransactionData = new MatTableDataSource(sortbyDate);
  }

  updateEstimatedBalanceForBank(data: {
    balance: number;
    deposit: number;
    withdraw: number;
  }) {
    if (!this.activeBank) {
      return;
    }
    this.activeBank.estimatedBalance = data.balance;
    this.activeBank.totalDeposit = data.deposit;
    this.activeBank.totalWithdrawn = data.withdraw;
    this.bankService.updateBankDetails(this.activeBank).subscribe(
      (data) => {
        console.log('UPDATED');
      },
      (err) => {
        console.log('ERROR!!!');
      }
    );
  }

  onDeleteTransaction(rec: any) {
    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: 'Yes',
        cancelButtonText: 'No',
        hideCancel: false,
        title: 'Delete Transaction',
        message: `Are you sure you want to delete transaction?`,
      },
    };

    const dialog = this.dialog?.open(ConfirmDialogComponent, dialogObj);

    dialog?.afterClosed().subscribe((result) => {
      if (result) {
        this.transactionService.delete(rec).subscribe(
          (data) => {
            this.transactionService.syncStore();
            this.toast.success('Transaction deleted successfully.', 'close');
          },
          (err) => {
            this.toast.warning(
              'Unable to perform requested operation. Please try again later.',
              'close'
            );
          }
        );
      }
    });
  }

  onEditTransaction(rec: any) {
    //console.log(rec);
  }
}
