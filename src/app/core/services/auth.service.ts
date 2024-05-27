import { Injectable } from '@angular/core';
import {AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { getAuth,onAuthStateChanged } from "firebase/auth";
import { ReplaySubject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/component/confirm-dialog/confirm-dialog.component';
import { ToastMessageService } from './toast-message.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //auth = getAuth();
  authState: any = null;

  public currentUser$: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private fireauth : AngularFireAuth,
    private router : Router,
    private toast: ToastMessageService,
    private token: TokenStorageService,
    private dialog : MatDialog
    ) {
      /* onAuthStateChanged(this.auth,(user)=>{
        if(user){
          this.currentUser$.next(user);
        }else{
          //no user login.
        }
      }) */
    }

    get isAuthenticated():boolean{
      return this.authState !== null; 
    }
    get currentUserId(): string {
      return this.isAuthenticated ? this.authState.uid : null;
    }
    get isEmailVerified(): boolean {
      return this.isAuthenticated ? this.authState.emailVerified : false;
    }

  // login method
  login(email : string, password : string) {
    this.fireauth.signInWithEmailAndPassword(email,password).then( res => {
      res.user?.getIdToken().then((token)=>{
        this.token.saveToken(token);
        if(res.user?.emailVerified == true) {
          this.router.navigate(['home','overview']);
         } else {
          this.router.navigate(['auth','verify-email']);
        }
      })
    }, err => {
      this.toast.info(err.message,'close');
        this.router.navigate(['auth','login']);
    })
  }

  // register method
  register(email : string, password : string) {
    this.fireauth.createUserWithEmailAndPassword(email, password).then( res => {
      this.sendEmailForVerification(res.user);
    }, err => {
      this.toast.info(err.message,'close');
      this.router.navigate(['auth','login']);
    })
  }

  resendVerification(){
    this.fireauth.currentUser.then((res)=>{
      res?.sendEmailVerification().then(()=>{
        this.toast.success('Email has been sent for verification.','close');
      },()=>{
        this.toast.warning('Some error occured, Please try again later.','close');
      })
    })
  }
  // sign out
  logout() {
    this.fireauth.signOut().then( () => {
      this.token.signOut();
      this.router.navigate(['auth']);
    }, err => {
      alert(err.message);
    })
  }

   // email varification
   sendEmailForVerification(user : any) {
    user.sendEmailVerification().then((res : any) => {
      this.toast.success('Registration successfull','close');
      this.router.navigate(['auth','verify-email'],{state:{email:user.email,action:'new-user'}});
    }, (err : any) => {
      this.toast.warning('Something went wrong. Not able to send mail to your email.','close');
    })
  }

  sendResetPassword(email: string){
    this.fireauth.sendPasswordResetEmail(email).then((res)=>{
      this.router.navigate(['auth','verify-email'],{state:{email:email,action:'reset-password'}});
    },err=>{
      this.toast.warning('Something went wrong. Not able to send mail to your email.','close');
    })
  }

  reLoginPrompt(){
    let dialogObj = {
      minWidth: 450,
      disableClose: true,
      data: {
        okButtonText: 'Login',
        cancelButtonText: 'No',
        hideCancel: 'yes',
        title: 'Relogin Required',
        message: `Sorry, it looks like you do not have sufficient permission to perform this action.
        Please give Relogin a try or contact support to understand which permissions are required for this action.`,
      }
    }
    const dialog = this.dialog?.open(ConfirmDialogComponent, dialogObj);

    dialog.afterClosed().subscribe((result)=>{
      if(result){
        this.logout();
        this.router.navigate(['auth','login']);
      }
    },err=>{
    })
  }


}