import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shop-evaluation-report',
  templateUrl: './shop-evaluation-report.component.html',
  styleUrls: ['./shop-evaluation-report.component.sass']
})
export class ShopEvaluationReportComponent implements OnInit {
  dateSelected = false;
  message: any;

  constructor() { }

  ngOnInit(): void {
  }

  selectDateBTW(): void {
    this.dateSelected = true;
    this.message = 'Best to Worst Summary.';
  }

  selectDatePS(): void {
    this.dateSelected = true;
    this.message = 'Profit Sale Summary.';
  }
}
