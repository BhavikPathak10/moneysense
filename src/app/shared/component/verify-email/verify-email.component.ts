import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {

  user: string = 'you';

  constructor(private router: Router ) {
    this.user = this.router.getCurrentNavigation()?.extras?.state ? this.router.getCurrentNavigation()!.extras!.state!['email'] : this.user
  }

  
  ngOnInit(): void {
  }

  navigateTo(){
    this.router.navigate(['auth','login']);
  }

}
