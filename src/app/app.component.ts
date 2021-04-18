import { Component } from '@angular/core';
import { RealTimeDataService } from './services/real-time-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'weaver';
  /**
   *
   */
  constructor(private rtService: RealTimeDataService) {
    console.log('from app', this.rtService.serverConnected())
  }
}
