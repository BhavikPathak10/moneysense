import { Component } from '@angular/core';
import { ResponsiveService } from './core/services/responsive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {

  constructor(private responsive : ResponsiveService) {}

}
