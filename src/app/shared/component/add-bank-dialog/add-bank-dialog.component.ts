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

  bankForm: FormGroup = new FormGroup({
    accountName: new FormControl(null, Validators.required),
    bankName: new FormControl(null, Validators.required),
    branch: new FormControl(null, Validators.required),
    accountNumber: new FormControl(null),
    accountType: new FormControl(null, Validators.required),
    currentBalance: new FormControl(null),
  });

  constructor(public dialogRef: MatDialogRef<AddBankDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {}

  onSaveBank() {
    if (this.bankForm.valid) {
      this.dialogRef.close(this.bankForm.value);
    }
  }
}
