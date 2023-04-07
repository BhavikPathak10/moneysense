import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent implements OnInit {

  list:any = Array(1000).fill('SOME CONTENT HERE'); 
  constructor() { }

  ngOnInit(): void {
  }

}
