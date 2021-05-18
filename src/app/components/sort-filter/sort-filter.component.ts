import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {filter} from 'rxjs/operators';
import {any} from 'codelyzer/util/function';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.sass']
})
export class SortFilterComponent implements OnInit {

  @Input() listItems: any[];
  user: any;
  @Output() filterEmitter = new EventEmitter<any[]>();
  dateSelected = true;
  startDate: Date;
  endDate: Date;
  constructor(
    private userManager: AuthService
  ) { 
    this.user = userManager.getUserData()
  }

  ngOnInit(): void {
  }

  filterData(duration: string): void {
    let filteredItems = [];
    let filterDuration;
    switch (duration) {
      case '1day':
        filterDuration = new Date(Date.now()).toLocaleDateString('en-GB');
        filteredItems = this.listItems.filter((item) => moment(item.date || item.generatedAt).format('DDMMYYYY') === moment().format('DDMMYYYY'));
        break;
      case '7day':
        const week = moment().week();
        filteredItems = this.listItems.filter((item) => moment(new Date(item.date)).week() === week);
        this.listItems.forEach((item) => {
          const dateArray = item.date.split('/');
          const date = new Date(dateArray[2], dateArray[1], dateArray[0]);
          item.date = date;
        });
        break;
      case 'define':
        // this.dateSelected = true;
        filteredItems = this.listItems.filter((item) => moment(item.date).isBetween(this.startDate, this.endDate))
        
        break;
    }

    this.filterEmitter.emit(filteredItems);
  }

  setStartDate(startDate: any): void {
    this.startDate = startDate
  }

  setEndDate(endDate: any): void {
    this.endDate = endDate
    
    const filteredItems = this.listItems.filter((item) => moment(item.date || item.generatedAt).isBetween(this.startDate, this.endDate, 'days', '[]'))
    this.filterEmitter.emit(filteredItems)
  }
}
