import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  user: string = 'you';
  action :string = '';
  state : any =undefined;

  constructor(private router: Router, private auth : AuthService ) {
     this.state = this.router.getCurrentNavigation()?.extras?.state;
    this.action = this.state?.['action'];
  }

  
  ngOnInit(): void {
  }

  resendVerification(){
    this.auth.resendVerification();
  }

  navigateTo(){
    this.router.navigate(['auth','login']);
  }

}
