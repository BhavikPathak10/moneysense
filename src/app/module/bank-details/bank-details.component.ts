import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.scss'],
  host:{
    class:'full-page flexColumn'
  }
})
export class BankDetailsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
