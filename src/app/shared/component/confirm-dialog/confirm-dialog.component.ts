import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      hint?: string;
      okButtonText?: string;
      cancelButtonText?: string;
      hideCancel?: boolean;
      icon?: string;
    }
  ) {}

  ngOnInit(): void {}

  onOkClick() {
    this.dialogRef.close(true);
  }
}
