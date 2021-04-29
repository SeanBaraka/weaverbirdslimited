import { Component, OnInit } from '@angular/core';
import {StockDataService} from '../../services/stock-data.service';

@Component({
  selector: 'app-shop-suppliers-report',
  templateUrl: './shop-suppliers-report.component.html',
  styleUrls: ['./shop-suppliers-report.component.sass']
})
export class ShopSuppliersReportComponent implements OnInit {

  suppliers: [] = []
  constructor(
    private shopData: StockDataService
  ) { }

  ngOnInit(): void {
    this.getSupplierList();
  }

  getSupplierList(): void {
    this.shopData.getSuppliers().subscribe((suppliers) => {
      this.suppliers = suppliers;
    });
  }

  updateSupplier(supplier: any): void {

  }

  removeSupplier(id: any): void{

  }
}
