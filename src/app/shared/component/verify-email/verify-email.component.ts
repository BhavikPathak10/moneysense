import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  user: string = 'you';
  action :string = '';
  state : any =undefined;

  constructor(private router: Router ) {
     this.state = this.router.getCurrentNavigation()?.extras?.state;
    this.action = this.state?.['action'];
  }

  
  ngOnInit(): void {
  }

  navigateTo(){
    this.router.navigate(['auth','login']);
  }

}
