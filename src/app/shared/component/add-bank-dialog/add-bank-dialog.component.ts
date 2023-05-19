import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, startWith, map, Subscription } from 'rxjs';
import { AccountType } from 'src/app/core/constants/bank.constant';
import { Master } from 'src/app/core/enums/master.enum';
import { MasterStore } from 'src/app/core/stores/master.store';

@Component({
  selector: 'app-add-bank-dialog',
  templateUrl: './add-bank-dialog.component.html',
  styleUrls: ['./add-bank-dialog.component.scss'],
})
export class AddBankDialogComponent implements OnInit {
  accountTypeConstant = AccountType;
  showOtherFields : boolean = false;

  bankForm: FormGroup = new FormGroup({
    accountLedger : new FormControl(null),
    accountURL : new FormControl(null),
    customerID : new FormControl(null),
    accountPWD : new FormControl(null),
    accountTxnPWD : new FormControl(null),
    accountName: new FormControl(null, Validators.required),
    bankName: new FormControl(null, Validators.required),
    branch: new FormControl(null, Validators.required),
    accountNumber: new FormControl(null),
    accountType: new FormControl(null, Validators.required),
    currentBalance: new FormControl(null),
  });
  
  filteredMasterDetails: Observable<any[]> | undefined;
  subscription: Subscription[] =[];
  masterDetail: any;
  MASTER = Master;

  constructor(public dialogRef: MatDialogRef<AddBankDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private masterStore:MasterStore) {
    this.subscription.push(
      this.masterStore.bindStore().subscribe((data) => {
        this.masterDetail = data;
      }),
    )
  }

  ngOnInit(): void {
    this.filteredMasterDetails = this.accountLedger?.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
    if(this.data.bankdata){
      this.bankForm.get('accountLedger')?.setValue(this.data.bankdata.accountLedger);
      this.bankForm.get('accountURL')?.setValue(this.data.bankdata.accountURL);
      this.bankForm.get('customerID')?.setValue(this.data.bankdata.customerID);
      this.bankForm.get('accountPWD')?.setValue(this.data.bankdata.accountPWD);
      this.bankForm.get('accountTxnPWD')?.setValue(this.data.bankdata.accountTxnPWD);
      this.bankForm.get('accountName')?.setValue(this.data.bankdata.accountName);
      this.bankForm.get('accountName')?.disable();
      this.bankForm.get('bankName')?.setValue(this.data.bankdata.bankName);
      this.bankForm.get('branch')?.setValue(this.data.bankdata.branch);
      this.bankForm.get('accountNumber')?.setValue(this.data.bankdata.accountNumber);
      this.bankForm.get('accountType')?.setValue(this.data.bankdata.accountType);
      this.bankForm.get('currentBalance')?.setValue(this.data.bankdata.currentBalance);
      this.bankForm.get('currentBalance')?.disable();
    }
    if(this.data.isViewData){
      this.bankForm.get('accountLedger')?.disable();
      this.bankForm.get('accountURL')?.disable();
      this.bankForm.get('customerID')?.disable();
      this.bankForm.get('accountPWD')?.disable();
      this.bankForm.get('accountTxnPWD')?.disable();
    }
  }

get accountLedger(){
  return this.bankForm.get('accountLedger');
}

  onSaveBank() {
    if (this.bankForm.valid) {
     let data =   this.data.bankdata ? {...this.data.bankdata,...this.bankForm.value} : {...this.bankForm.value};
      this.dialogRef.close(data);
    }
  }

  private _filter(value: string): any {
    const filterValue = value?.toLowerCase();
    return this.masterDetail?.filter((option: any) =>
      option[this.MASTER.LEDGER].toLowerCase().includes(filterValue)
    );
  }
}
