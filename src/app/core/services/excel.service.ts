import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import * as XLSX from 'xlsx';
import { BankDetailsStore } from '../stores/bank.store';
import { IncomeAtGlanceStore } from '../stores/incomeAtGlance.store';
import { MasterStore } from '../stores/master.store';
import { PendingPaymentStore } from '../stores/pendingPayemnt.store';
import { TransactionStore } from '../stores/transaction.store';
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
    private bankStore: BankDetailsStore,
    private transactionStore: TransactionStore,
    private masterStore: MasterStore,
    private incomeStore : IncomeAtGlanceStore,
    private pendingStore : PendingPaymentStore,
  ) {
    combineLatest({
      transaction : this.transactionStore.bindStore(),
      bank : this.bankStore.bindStore(),
      master: this.masterStore.bindStore(),
      incomeAtGlance : this.incomeStore.bindStore(),
      pendingPayment : this.pendingStore.bindStore()
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
      master:this.transformDataForExport(this.master),
      transactions:this.transformDataForExport(this.transaction),
      banks:this.transformDataForExport(this.bank),
      incomeAtGlance:this.transformDataForExport(this.income),
      pendingPayment:this.transformDataForExport(this.payment)
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

  private transformDataForExport(data:any){
    return data.map((d:any)=>{
      delete d.id;
      return d;
    })
  }
}