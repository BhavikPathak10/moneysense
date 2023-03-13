import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import * as XLSX from 'xlsx';
import { BankService } from './bank.service';
import { IncomeService } from './income.service';
import { MasterService } from './master.service';
import { PendingPaymentService } from './pending-payment.service';
import { TransactionService } from './transaction.service';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  bank:[] = [];
  transaction : []=[];
  master : []=[];
  income:[] = [];
  payment:[] =[];

  constructor(
    private bankService: BankService,
    private transactionService: TransactionService,
    private masterService: MasterService,
    private incomeService : IncomeService,
    private pendingPayemntService : PendingPaymentService,
  ) {
    combineLatest({
      transaction : this.transactionService.getTransactionDetails(),
      bank : this.bankService.getBankDetails(),
      master: this.masterService.getMasterDetails(),
      incomeAtGlance : this.incomeService.getIncomeAtGlanceDetails(),
      pendingPayment : this.pendingPayemntService.getPendingPaymentDetails()
     }).subscribe((data)=>{
      this.bank= data.bank;
      this.transaction = data.transaction;
      this.master = data.master;
      this.income = data.incomeAtGlance;
      this.payment = data.pendingPayment;
     });
   }

  public exportAllDetails(fileName?:string){
    this.exportBackupAsExcelFile({
      master:this.master,
      transactions:this.transaction,
      banks:this.bank,
      incomeAtGlance:this.income,
      pendingPayment:this.payment
    },'MoneySense_Backup_'+moment().format("Do_MMM_YYYY_HH_mm"));
  }

  public exportBackupAsExcelFile(json: {master:[],transactions:[],banks:[],incomeAtGlance:[],pendingPayment:[]},excelFileName: string): void {
    const masterWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json?.master);
    const transactionWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json?.transactions);
    const bankWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json?.banks);
    const incomeWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json?.incomeAtGlance);
    const paymentWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json?.pendingPayment);
    const workbook: XLSX.WorkBook = { 
      Sheets: {
        'Master':masterWorksheet,
        'Transactions':transactionWorksheet,
        'Banks':bankWorksheet,
        'Income At Glance':incomeWorksheet,
        'Pending Payment':paymentWorksheet
      },
      SheetNames: ['Master','Transactions','Banks','Income At Glance','Pending Payment']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportJsonAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}