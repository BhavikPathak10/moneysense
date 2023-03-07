import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastMessageService {
  constructor(public snackBar: MatSnackBar) {}

  default_message: string = 'Some error occured.';
  //actionButtonLabel: string = "Close";
  //action: boolean = true;
  //setAutoHide: boolean = true;
  autoHide: number = 5000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  private showMessage(
    messageType: Array<string>,
    message: string,
    actionButtonLabel?: string,
    //setAutoHide?: boolean,
    hideDuration?: number
  ) {
    let config = new MatSnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = hideDuration ? hideDuration : this.autoHide;
    config.panelClass = messageType;

    this.snackBar.open(
      message ? message : this.default_message,
      actionButtonLabel ? actionButtonLabel : undefined,
      config
    );
  }

  info(message: string, action: string) {
    this.showMessage(['info-message'], message, action);
  }

  alert(message: string, action: string) {
    this.showMessage(['alert-message'], message, action);
  }

  warning(message: string, action: string) {
    this.showMessage(['warn-message'], message, action);
  }

  success(message: string, action: string) {
    this.showMessage(['success-message'], message, action);
  }
}
