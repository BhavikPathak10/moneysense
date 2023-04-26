import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { debounceTime, map, Observable, startWith, Subscription } from 'rxjs';
import { MY_DATE_FORMATS } from 'src/app/core/constants/dateFormat.constant';
import { TransactionType, TransactionMode } from 'src/app/core/constants/transaction.constant';
import { Master } from 'src/app/core/enums/master.enum';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { MasterStore } from 'src/app/core/stores/master.store';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    DatePipe
  ],
})
export class TransactionDetailsComponent implements OnInit {

  transactionTypeOption = TransactionType;
  transactionModeOption = TransactionMode;
  MASTER = Master;
  
  subscription : Subscription[] = [];

  masterDetail: any;
  bankDetails :any;

  filteredMasterDetails: Observable<any[]> | undefined;
  filteredBankDetails: Observable<any[]> | undefined;

  _paymentDetails:any;
  get paymentDetail(){
    return this._paymentDetails;
  }
  @Input ('paymentDetail') set paymentDetail(value:any){
    this._paymentDetails = {
      bank: value.bank ? value.bank : '' ,
      particular:value.particular ? value.particular:'' ,
      reference:value.reference ? value.reference : '' ,
      transactionType:value.transactionType ? value.transactionType :'',
      transactionMode: value.transactionMode ? value.transactionMode : '',
      remark: value.remark ? value.remark : '',
    }
    this.transactionForm.patchValue(this._paymentDetails,{emitEvent:false});
  }

  _transactionDetail:any;
  get transactionDetail(){
    return this._transactionDetail;
  }
  @Input ('transactionDetail') set transactionDetail(value:any){
    this._transactionDetail = value;
    this.transactionForm.get('transactionDate')?.setValue(new Date(value.date),{emitEvent:false});
    this.transactionForm.get('transactionAmount')?.setValue(value.amount,{emitEvent:false});
  }

  @Output() update = new EventEmitter<any>();

  transactionForm: FormGroup = new FormGroup({
    bank:new FormControl(null,Validators.required),
    transactionDate: new FormControl(null,Validators.required),
    particular: new FormControl(null, [Validators.required,this.requireMatch.bind(this)]),
    reference: new FormControl(null),
    transactionType: new FormControl(null,Validators.required),
    transactionMode: new FormControl(null,Validators.required),
    transactionAmount: new FormControl(null,Validators.required),
    remark: new FormControl(null),
  });

  get particular() {
    return this.transactionForm.get('particular');
  }
  
  get bank() {
    return this.transactionForm.get('bank');
  }

  constructor(
    private masterStore : MasterStore,
    private bankStore : BankDetailsStore 
  ) {
    this.subscription.push(
      this.masterStore.bindStore().subscribe((data) => {
        this.masterDetail = data;
      }),
      this.bankStore.bindStore().subscribe((data:BankDetails[])=>{
        this.bankDetails = data;
      })
    );
   }

  ngOnInit(): void {
    this.filteredMasterDetails = this.particular?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
    this.filteredBankDetails = this.bank?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterBank(value))
    );

    this.transactionForm.valueChanges.pipe(
      map(i=>i),
      debounceTime(900)
    ).subscribe((val)=>{
      this.update.emit(val);
    })

    if(this.transactionDetail){
      this.update.emit(this.transactionForm.value);
    }
  }

  private _filter(value: string): any {
    const filterValue = value?.toLowerCase();
    return this.masterDetail?.filter((option: any) =>
      option[this.MASTER.LEDGER].toLowerCase().includes(filterValue)
    );
  }

  private _filterBank(value: string): any {
    const filterValue = value?.toLowerCase();
    return this.bankDetails?.filter((option: BankDetails) =>
      option['accountName'].toLowerCase().includes(filterValue)
    );
  }

  private requireMatch(control: FormControl): ValidationErrors | null {
    const selection: any = control.value;
    if (this.masterDetail && this.masterDetail.find((z:any)=> z[this.MASTER.LEDGER] == selection)) {
      return null;
    }
    return { requireMatch: true };
  }

  ngOnDestroy(){
    this.subscription.map((sub)=>sub.unsubscribe());
  }

}
