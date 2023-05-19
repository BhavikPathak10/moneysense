import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
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
import { Clipboard } from "@angular/cdk/clipboard";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DatePipe, registerLocaleData } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from 'src/app/core/constants/dateFormat.constant';
import { AddBankDialogComponent } from 'src/app/shared/component/add-bank-dialog/add-bank-dialog.component';
import enIN from '@angular/common/locales/en-In';

@Component({
  selector: 'app-passbook',
  templateUrl: './passbook.component.html',
  styleUrls: ['./passbook.component.scss'],
  host: {
    class: 'flexColumn flex-1',
  },
  providers:[    {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE]
  },
  { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  DatePipe]
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

  range:FormGroup = new FormGroup({
    start: new FormControl(moment().startOf('month')),
    end: new FormControl(moment().endOf('month')),
  });

  transactionEnum = TransactionEnum;
  editRecord :any;

  constructor(
    private route: ActivatedRoute,
    private router : Router,
    private bankStore: BankDetailsStore,
    private bankService: BankService,
    private transactionStore: TransactionStore,
    private transactionService: TransactionService,
    private dialog: MatDialog,
    private toast: ToastMessageService,
    private clipboard: Clipboard
  ) {
    registerLocaleData(enIN);
    this.subscription.push(
      this.route.params.subscribe((param) => {
        this.activeId = param['bank_accountName'];
        if (this.banks.length > 0) {
          this.updateDataByBank();
        }
      }),
      this.bankStore.bindStore().subscribe((data) => {
        this.banks = data;
        if (this.activeId && this.banks.length > 0) {
          this.updateDataByBank();
        }
      }),
      this.transactionStore.bindStore().subscribe((data: Transaction[]) => {
        this.transactionData = data.map((x) =>
          new Transaction().deserialize(x)
        );
        this.computeTableData();
      }),
      this.transactionService.selectedTransaction$.subscribe((data)=>{
        this.editRecord = data;
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
    this.transactionService.selectedTransaction$.next(false);
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
    this.bankService.updateBankDetails(this.activeBank)?.subscribe(
      (data) => {
        //this.bankService.syncStore();
      },
      (err) => {
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
        hideCancel: 'no',
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

  onEditCancelTransaction(rec: any) {
    if(this.editRecord && rec.id !== this.editRecord.id){
      this.toast.info('Please save or cancel the changes on the current transaction before proceeding with editing another one.','close');
      return;
    }
    rec.isEdited = !rec.isEdited;
    this.editRecord = false;
    if(rec.isEdited){
      this.editRecord = rec;
    }
    this.transactionService.selectedTransaction$.next(this.editRecord);
  }

  onExportBankDetails(){
    const jsPDFDoc = new jsPDF();

    let tableData = JSON.parse(JSON.stringify(this.bankTransactionData.data));

    let startDate:any = undefined;
    let endDate:any = undefined;
    
    if(this.range.value.start){
      startDate = moment(this.range.value.start);
    }
    if(this.range.value.end){
       endDate = moment(this.range.value.end);
    }
    
    let selectedRangeData = tableData.filter((data:any)=> {
      let compareDate = moment(data.transactionDate);
     
      if(compareDate.isBetween(startDate,endDate,null,'[]')){
        return data;
      }
      
    });
    
    let tableFlatData = selectedRangeData.map((data:Transaction)=>{
      return [
        moment(data.transactionDate).format('D-MMM-YYYY'),
        data.particular, 
        data.reference,
        data.mode,
        data.deposit.toLocaleString(),
        data.withdrawal.toLocaleString(),
        data._balance?.toLocaleString()
      ]
      });
      tableFlatData.push(['Total', '','','',this.estimatedDeposit,this.estimatedWithdrawal,this.estimatedBalance]);
      let header = this.activeId;
      let subHead = `${this.activeBank?.accountNumber} | ${this.activeBank?.bankName} | ${this.activeBank?.branch} | ${this.activeBank?.accountType}`;

      jsPDFDoc.setFontSize(18);
      jsPDFDoc.text(header, 14, 22);
      jsPDFDoc.setFontSize(11);
      jsPDFDoc.setTextColor(100);

      let pageSize = jsPDFDoc.internal.pageSize;
      let pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      let text = jsPDFDoc.splitTextToSize(subHead, pageWidth - 35, {});
      jsPDFDoc.text(text, 14, 30);

    autoTable(jsPDFDoc, 
      {
        head:[['Date','Ledger','Reference','Mode','Deposit','Withdraw','Balance']],
        body:tableFlatData,
        startY:35,
        showHead:'everyPage',
      }
    );
    let filename = `${this.activeId}_${moment().format("Do_MMM_YYYY_HH_mm")}.pdf`;
    jsPDFDoc.save(filename);
  } 

  copyDetails(){
    let text = `Customer ID : ${this.activeBank?.customerID}\nAccount PWD : ${this.activeBank?.accountPWD}\nAccount Txn PWD : ${this.activeBank?.accountTxnPWD}`;
    this.clipboard.copy(text);
    this.toast.info("Text copied to clipboard",'close');
  }

  editBank(event? : any, bankdata? : any){
    event && event.preventDefault();

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
            this.router.navigate(['home','bank', result.accountName]);
            this.toast.success(
              `${result.accountName} Bank updated successfull`,
              'close'
            );
          })
        }
      },
      (err) => {
            this.toast.warning(
              `Some error occured. Please try again later.`,
              'close'
            );
      }
      )
  }

  deleteBank(event: any, bank?: BankDetails) {
    event && event.preventDefault();

    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: 'Yes',
        cancelButtonText: 'No',
        hideCancel: 'no',
        title: 'Delete Bank',
        message: `Are you sure you want to delete ${bank?.accountName} and its transactions?`,
      },
    };

    const bankDialog = this.dialog.open(ConfirmDialogComponent, dialogObj);

    bankDialog.afterClosed().subscribe((result: BankDetails) => {
      if (result) {
        this.transactionService.deleteBankTransaction(bank!);
        this.router.navigate(['home','overview']);
        this.toast.success(
          `Bank ${bank!.accountName} deleted successfully.`,
          'close'
        );
      }
    });
  }

  viewBankDetails(event:any, bankData: any){
    event && event.stopPropagation();

    let dialogObj = {
      minWidth: 450,
      disableClose: false,
      data: { isOnboarding: false,isViewData:true, bankdata : bankData },
    };

    this.dialog.open(AddBankDialogComponent, dialogObj);
  }
 
  isRecordDisabled(el:any){
    if(el.id == this.editRecord.id){
      return false;
    }
    return true;
  }

  ngOnDestroy(){
    this.subscription.map(sub=>sub.unsubscribe());
  }
}
