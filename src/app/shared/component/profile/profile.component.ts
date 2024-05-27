import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  subscription :Subscription[] = [];
  userData:any = null;
  userDataForm: FormGroup = new FormGroup({});

  constructor(private userService:UserService,private fb : FormBuilder) {
    this.subscription.push(
      this.userService.currentUser$.asObservable().subscribe((data:User)=>{
        this.userData = data;
        this.loadForm();
      })
    )
   }

  ngOnInit(): void {
  }

  loadForm(){
    this.userDataForm = this.fb.group({
      phoneNumber: this.fb.control(this.userData.phoneNumber,[Validators.minLength(10),Validators.maxLength(15)]),
      displayName: this.fb.control(this.userData.displayName)
    });
  }

  onUserDataFormSubmit(){
    if(this.userDataForm.valid){
      let sub = [];
      let phone = this.userDataForm.get('phoneNumber')?.value;
      if(phone){
        sub.push(this.userData.updatePhoneNumber());
      }
      let name = this.userDataForm.get('displayName')?.value;
      if(name){
        sub.push(this.userData.updateProfile({'displayName':name}));
      }
      Promise.all(sub).then((result)=>{
        console.log(result);
        console.log('updated');
        
      },(err)=>{
        console.log(err);
      })
    }
  }
}
