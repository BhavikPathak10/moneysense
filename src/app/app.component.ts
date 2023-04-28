import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './shared/component/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {

  constructor(public breakpointObserver: BreakpointObserver,private dialog: MatDialog) {}

  ngOnInit():void{
    this.breakpointObserver
      .observe([Breakpoints.XSmall,Breakpoints.Small,Breakpoints.TabletPortrait])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          let dialogObj = {
            maxWidth:390,
            disableClose: false,
            data: {
              okButtonText: 'Continue',
              cancelButtonText: 'No',
              hideCancel: 'yes',
              title: 'Optimal Viewing Experience',
              message: `Please rotate to landscape mode for optimal viewing. Screen optimized for medium-sized devices. Mobile optimization in progress. Thank you.`,
            }
          }
          this.dialog?.open(ConfirmDialogComponent, dialogObj);
        }
      });
  }

}
