import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shop-sales-payments-report',
  templateUrl: './shop-sales-payments-report.component.html',
  styleUrls: ['./shop-sales-payments-report.component.sass']
})
export class ShopSalesPaymentsReportComponent implements OnInit {

  salesPayments: any[] =[]
  constructor() { }

  ngOnInit(): void {
  }

  /** reprint the transaction */
  reprintReceipt(id: number): void {
    
  }

}
