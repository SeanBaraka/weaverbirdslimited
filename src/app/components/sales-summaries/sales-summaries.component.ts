import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sales-summaries',
  templateUrl: './sales-summaries.component.html',
  styleUrls: ['./sales-summaries.component.sass']
})
export class SalesSummariesComponent implements OnInit {

  @Input() saleRecords: any[]
  constructor() { }

  ngOnInit(): void {
    
  }

  filterSalesControl(parameter: any): void {

  }

  printSaleReport(): void {
    
  }

}
