import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-print-filter',
  templateUrl: './search-print-filter.component.html',
  styleUrls: ['./search-print-filter.component.sass']
})
export class SearchPrintFilterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  /** filter sales records based on a certain criteria */
  filterSalesControl(param: any): void {

  }
}
