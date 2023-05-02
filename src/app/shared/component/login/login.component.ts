import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TaskUpdatedEvent } from 'devextreme/ui/gantt';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

form: FormGroup = new FormGroup({});
isSignUp:boolean = false;
resetPassword:boolean = false;

showSignUpFlow : boolean = false;

constructor(private fb: FormBuilder, private auth: AuthService, private dialog : MatDialog) { }

ngOnInit() {
  this.loadForm();
  this.dialog.closeAll();
}

loadForm(email?:string){
  let _email = email || null; 

  if(this.form && this.form.controls){
    this.form.removeControl('email');
    this.form.removeControl('password');
    this.form.removeControl('confirmPassword');
  }
  

  if(this.isSignUp){
    this.form = this.fb.group({
      email: this.fb.control(_email,[Validators.required,Validators.email]),
      password: this.fb.control(null, [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control(null, [Validators.required,this.createCompareValidator.bind(this)])
    });
  }else{
    this.form = this.fb.group({
      email: this.fb.control(_email,[Validators.required,Validators.email]),
      password: this.fb.control(null, [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control(null)
    });
    if(this.resetPassword){
      this.form.get('password')?.clearValidators();
    }
  }

  /* this.form.markAsUntouched();
  this.form.markAsPristine();
  
  Object.entries(this.form.controls).forEach((c)=>{
    c[1].markAsPristine();
    c[1].markAsUntouched();
  }) */
}

createCompareValidator() {
  if (this.form.get('password')?.value !== this.form.get('confirmPassword')?.value)
    return { match_error: 'Value does not match' };
  return null;
};

onSubmit(){
  if(this.form.valid){
  if(this.isSignUp){
    this.auth.register(this.form.get('email')?.value,this.form.get('password')?.value);
  }else if(this.resetPassword){
    this.auth.sendResetPassword(this.form.get('email')?.value);
  }else{
    this.auth.login(this.form.get('email')?.value,this.form.get('password')?.value);
  }
}
}

togglePages(){
  this.isSignUp = !this.isSignUp;
  this.resetPassword = false;
  this.loadForm(this.form.get('email')?.value);
}

forgotPassword(){
  this.resetPassword = !this.resetPassword;
  this.loadForm(this.form.get('email')?.value);
}
}
