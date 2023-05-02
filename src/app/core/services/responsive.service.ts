import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReplaySubject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  public isTabletOrSmaller$: ReplaySubject<Boolean> = new ReplaySubject<Boolean>(1);

  constructor(public breakpointObserver: BreakpointObserver,private dialog: MatDialog) { 
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
          this.isTabletOrSmaller$.next(true);
          this.dialog?.open(ConfirmDialogComponent, dialogObj);
        }else{
          this.isTabletOrSmaller$.next(false);
        }
      });
  }

  
}
