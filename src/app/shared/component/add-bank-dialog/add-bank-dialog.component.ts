import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccountType } from 'src/app/core/constants/bank.constant';

@Component({
  selector: 'app-add-bank-dialog',
  templateUrl: './add-bank-dialog.component.html',
  styleUrls: ['./add-bank-dialog.component.scss'],
})
export class AddBankDialogComponent implements OnInit {
  accountTypeConstant = AccountType;
  showOtherFields : boolean = false;

  bankForm: FormGroup = new FormGroup({
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

  constructor(public dialogRef: MatDialogRef<AddBankDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    if(this.data.bankdata){
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
  }

  onSaveBank() {
    if (this.bankForm.valid) {
     let data =   this.data.bankdata ? {...this.data.bankdata,...this.bankForm.value} : {...this.bankForm.value};
      this.dialogRef.close(data);
    }
  }
}
