import { Component, OnInit } from '@angular/core';
import { StockDataService } from 'src/app/services/stock-data.service';
import {MatDialog} from '@angular/material/dialog';
import {AddSupplierComponent} from '../add-supplier/add-supplier.component';

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.sass']
})
export class SuppliersComponent implements OnInit {

  suppliers: any[];
  constructor(
    private shopService: StockDataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getSuppliers();
  }

  getSuppliers(): void {
    this.shopService.getSuppliers().subscribe((res) => {
      this.suppliers = res;
    });
  }

  filterSupplier(value: any): void {

  }

  addSupplier(): void {
    this.dialog.open(AddSupplierComponent, {
      width: '540px'
    });
  }
}
