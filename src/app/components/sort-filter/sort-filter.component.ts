import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {filter} from 'rxjs/operators';
import {any} from 'codelyzer/util/function';

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.sass']
})
export class SortFilterComponent implements OnInit {

  @Input() listItems: any[];
  @Output() filterEmitter = new EventEmitter<any[]>();
  dateSelected = false;
  constructor() { }

  ngOnInit(): void {
  }

  filterData(duration: string): void {
    let filteredItems = [];
    let filterDuration;
    switch (duration) {
      case '1day':
        filterDuration = new Date(Date.now()).toLocaleDateString('en-GB');
        filteredItems = this.listItems.filter((item) => item.date === filterDuration);
        break;
      case '7day':
        const week = moment().week();
        filteredItems = this.listItems.filter((item) => moment(new Date(item.date)).week() === week);
        this.listItems.forEach((item) => {
          const dateArray = item.date.split('/');
          const date = new Date(dateArray[2], dateArray[1], dateArray[0]);
          item.date = date;
        });

        console.log(this.listItems[0]);
        break;
      case 'define':
        this.dateSelected = true;
        break;
    }

    this.filterEmitter.emit(filteredItems);
  }

}
