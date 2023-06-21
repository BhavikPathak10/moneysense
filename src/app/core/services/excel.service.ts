import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import * as XLSX from 'xlsx-js-style';
import { BankDetailsStore } from '../stores/bank.store';
import { IncomeAtGlanceStore } from '../stores/incomeAtGlance.store';
import { MasterStore } from '../stores/master.store';
import { PendingPaymentStore } from '../stores/pendingPayemnt.store';
import { TransactionStore } from '../stores/transaction.store';
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

  budgetPlannerExport(data:any){
    let workbook : XLSX.WorkBook = XLSX.utils.book_new();
    let arr_list:any = [];
    arr_list.push(['Task Name','Est. Budget','Recurrence text','Dates'])
    data.forEach((a:any)=>{    
      arr_list.push([a.taskName,a.taskEstBudget,a.recurText,...a.recurrenceDates])
    })
    let worksheet : XLSX.WorkSheet = XLSX.utils.sheet_add_json(workbook,arr_list,{skipHeader:true,origin:'A1'});
    
    let clr_green = {font: {color: { rgb: "00B050" }}};
    let clr_red = {font: {color: { rgb: "FF0000" }}};
    let clr_black = {font: {color: { rgb: "595959" }}};
    
    let offset = {row:1,col:3};
    let maxCol = offset.col;

    data.forEach((task:any,i:number)=>{
      let cDate:any = [];
      if(task.hasOwnProperty('completedDates')){
          cDate = task.completedDates.map((t:any)=>t.taskdate)
      }
      task.recurrenceDates.forEach((d:any,j:number)=>{
        let nCol = offset.col+j;
        maxCol = maxCol >= nCol ? maxCol : nCol;
        let cell :any = {
          row : offset.row+(i+1),
          col : this.nToAZ(nCol)
        }
        cell = cell.col+''+cell.row;
        worksheet[cell].t = 'd';

        let comment_part = {
          a: "MoneySense",
          t: "Completed"
        };

        if(cDate.includes(moment(d).format('YYYY/MM/DD'))){
          worksheet[cell].s = clr_green;
          /* if(!worksheet[cell].c) worksheet[cell].c = [];
          worksheet[cell].c.push(comment_part);
          worksheet[cell].c.hidden = true; */
        }else if(moment(d).isBefore(new Date())){
          worksheet[cell].s = clr_red;
        }else{
          worksheet[cell].s = clr_black;
        }
      })
  })

    workbook.SheetNames=['Budget Planner'];
    workbook.Sheets = {'Budget Planner':worksheet};

    worksheet['!autofilter'] = { ref:"A1" };
    worksheet['!cols'] = [{wch:20},{wch:10},{wch:40},...Array(maxCol).fill({wch:11})];

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Budget_Planner_'+moment().format("Do_MMM_YYYY_HH_mm"));
  }
  
  nToAZ(n:any):any {
    let a = Math.floor(n / 26);
    return a >= 0 ? this.nToAZ(a-1) + String.fromCharCode(65 + (n % 26)): '';
  }
}