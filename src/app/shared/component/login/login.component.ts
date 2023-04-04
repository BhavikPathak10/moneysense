import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

form: FormGroup = new FormGroup({});
isSignUp:boolean = false;

constructor(private fb: FormBuilder, private auth: AuthService) { }

ngOnInit() {
  this.loadForm();
}

loadForm(){
  if(this.isSignUp){
    this.form = this.fb.group({
      email: this.fb.control(null,[Validators.required,Validators.email]),
      password: this.fb.control(null, [Validators.required, Validators.minLength(5)]),
      confirmPassword: this.fb.control(null, [Validators.required,this.createCompareValidator.bind(this)])
    });
  }else{
    this.form = this.fb.group({
      email: this.fb.control(null,[Validators.required,Validators.email]),
      password: this.fb.control(null, [Validators.required, Validators.minLength(5)]),
      confirmPassword: this.fb.control(null)
    });
  }
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
  }else{
    this.auth.login(this.form.get('email')?.value,this.form.get('password')?.value);
  }
}
}

togglePages(){
  this.isSignUp = !this.isSignUp;

  this.form.removeControl('email');
  this.form.removeControl('password');
  this.form.removeControl('confirmPassword');

  this.loadForm();

  this.form.markAsUntouched();
  this.form.markAsPristine();
  Object.entries(this.form.controls).forEach((c)=>{
    c[1].markAsPristine();
    c[1].markAsUntouched();
  })
}

}
