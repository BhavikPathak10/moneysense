import { Injectable } from '@angular/core';
import {AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { InitService } from './init.service';
import { ToastMessageService } from './toast-message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireauth : AngularFireAuth, private router : Router, private toast: ToastMessageService,private initService : InitService) { }

  // login method
  login(email : string, password : string) {
    this.fireauth.signInWithEmailAndPassword(email,password).then( res => {
      res.user?.getIdToken().then((token)=>{
        localStorage.setItem('token',token);
        if(res.user?.emailVerified == true) {
          this.router.navigate(['home','overview']);
        } else {
          this.toast.success('Registration successfull','close');
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
      this.router.navigate(['auth','login']);
    }, err => {
      this.toast.info(err.message,'close');
      this.router.navigate(['auth','login']);
    })
  }

  // sign out
  logout() {
    this.fireauth.signOut().then( () => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    })
  }

   // email varification
   sendEmailForVerification(user : any) {
    user.sendEmailVerification().then((res : any) => {
      this.router.navigate(['auth','verify-email'],{state:{email:user.email}});
    }, (err : any) => {
      this.toast.warning('Something went wrong. Not able to send mail to your email.','close');
    })
  }
}
