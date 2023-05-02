import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, forkJoin, map, Observable, startWith, Subscription } from 'rxjs';
import {
  TransactionMode,
  TransactionType,
} from 'src/app/core/constants/transaction.constant';
import { Master } from 'src/app/core/enums/master.enum';
import { Transaction } from 'src/app/core/models/transaction.model';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { MasterStore } from 'src/app/core/stores/master.store';
import { TransactionEnum } from 'src/app/core/enums/transaction.enum';
import { BankDetailsStore } from 'src/app/core/stores/bank.store';
import { BankDetails } from 'src/app/core/models/bankDetails.model';
import { ToastMessageService } from 'src/app/core/services/toast-message.service';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from 'src/app/core/constants/dateFormat.constant';
import { TransactionStore } from 'src/app/core/stores/transaction.store';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    DatePipe
  ],
  host: {
    //class: 'fullWidth',
  },
}) 
export class TransactionComponent implements OnInit {
  transactionEnum = TransactionEnum;
  transactionTypeOption = TransactionType;
  transactionModeOption = TransactionMode;
  MASTER = Master;
  banks?: BankDetails[] = undefined;
  banksFiltered?: BankDetails[] = undefined;
  isOpen : boolean = false;
  isInternalTransfer : boolean = false;
  internalBankSelected : any = undefined;

  subscription: Subscription[] = [];
  masterDetail: any;
  referenceData:any = [];

  INTERNAL_TRANSFER_KEYS:Array<string> = ['Internal Transfer'];

  filteredMasterDetails: Observable<any[]> | undefined;
  filteredReference: Observable<any[]> | undefined;
  activeId: string = '';

  transactionForm: FormGroup = new FormGroup({
    transactionDate: new FormControl(null, Validators.required),
    particular: new FormControl(null, [Validators.required,this.requireMatch.bind(this)]),
    reference: new FormControl(null),
    transactionType: new FormControl(null, Validators.required),
    transactionMode: new FormControl(null, Validators.required),
    transactionAmount: new FormControl(null, Validators.required),
    remark: new FormControl(null),
  });

  get particular() {
    return this.transactionForm.get('particular');
  }

  get type() {
    return this.transactionForm.get('transactionType');
  }

  get amount() {
    return this.transactionForm.get('transactionAmount');
  }

  get reference() {
    return this.transactionForm.get('reference');
  }

  constructor(
    private masterStore: MasterStore,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private bankStore: BankDetailsStore,
    private toast: ToastMessageService,
    private transactionStore : TransactionStore
  ) {
    this.subscription.push(
      this.masterStore.bindStore().subscribe((data) => {
        this.masterDetail = data;
      }),
      this.route.params.subscribe((param) => {
        this.activeId = param['bank_accountName'];
        this.banksFiltered = this.banks?.filter((bank)=>bank.accountName !== this.activeId); 
      }),
      this.bankStore.bindStore().subscribe((data) => {
        this.banks = data;
        this.banksFiltered = this.banks?.filter((bank)=>bank.accountName !== this.activeId); 
      }),
      this.transactionStore.bindStore().subscribe((data)=>{
        this.referenceData = [...new Set(data.map((d:Transaction)=>d.reference).filter((d:any)=>d))];
      })
    );
  }

  private _filter(value: string): any {
    const filterValue = value?.toLowerCase();
    return this.masterDetail?.filter((option: any) =>
      option[this.MASTER.LEDGER].toLowerCase().includes(filterValue)
    );
  }

  private _filterRef(value: string): any {
    const filterValue = value?.toLowerCase();
    return this.referenceData?.filter((option: any) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private requireMatch(control: FormControl): ValidationErrors | null {
    const selection: any = control.value;
    if (this.masterDetail && this.masterDetail.find((z:any)=> z[this.MASTER.LEDGER] == selection)) {
      return null;
    }
    return { requireMatch: true };
  } 

  ngOnInit(): void {
    this.filteredMasterDetails = this.particular?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
    this.filteredReference = this.reference?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterRef(value))
    );
    this.reference?.valueChanges.pipe(
      debounceTime(500)
    ).subscribe((data:any)=>{
      if(this.INTERNAL_TRANSFER_KEYS.map(v=>v.toLowerCase()).includes(data.toLowerCase())){
        this.isInternalTransfer = true;
      }else{
        this.isInternalTransfer = false;
        this.internalBankSelected = '';
      }
    })
  }

  onAddTransaction(formDirective: FormGroupDirective) {
    if (this.transactionForm.valid) {
      let data = this.addcomputedValues(this.transactionForm.value);
      let objSubscription:any = {data1 : this.transactionService.add(data)};

      if(this.isInternalTransfer && this.internalBankSelected){
       let transferData = new Transaction().deserialize({
          ...data,
          accountName : this.internalBankSelected,
          transactionType:data.transactionType?.toLowerCase() === this.transactionEnum.WITHDARWAL ? this.transactionEnum.DEPOSIT.toUpperCase() : this.transactionEnum.WITHDARWAL.toUpperCase(),
          withdrawal : data.deposit,
          deposit : data.withdrawal
        });
        objSubscription = {...objSubscription, data2 : this.transactionService.add(transferData)};
      }

      forkJoin(objSubscription).subscribe((res)=>{
        this.transactionService.syncStore();
        this.toast.success('Transaction has been added.', 'close');
        formDirective.resetForm();
        this.onBankSelect(false);
        this.isInternalTransfer = false;
        this.transactionForm.reset();
      })
    }
  }

  addLedger(){
    this.router.navigate(['home','admin','master']);
    this.transactionService.returnBank$.next(this.activeId);
  }

  addcomputedValues(p_data: any) {
    let data: Transaction = new Transaction().deserialize(p_data);

    data.accountName = this.activeId;

    data.withdrawal =
      data.transactionType?.toLowerCase() ==
      this.transactionEnum.WITHDARWAL.toLowerCase()
        ? Number(data.transactionAmount)
        : 0;
    data.deposit =
      data.transactionType?.toLowerCase() ==
      this.transactionEnum.DEPOSIT.toLowerCase()
        ? Number(data.transactionAmount)
        : 0;

    let date = new Date(data.transactionDate);
    let currentYear = +date.toLocaleDateString('default', { year: '2-digit' });
    data.transactionMonth = date.toLocaleDateString('default', {
      month: 'short',
    });
    data.transactionFY =
      date.getMonth() > 2
        ? `FY ${currentYear}-${currentYear + 1}`
        : `FY ${currentYear - 1}-${currentYear}`;

    return data;
  }

  onBankSelect(val:any){
    this.internalBankSelected = val;
    this.isOpen = false;
  }
}
