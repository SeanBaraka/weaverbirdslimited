import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {StockDataService} from "../../services/stock-data.service";
import {SupplierService} from '../../services/supplier.service';
import {CustomerService} from '../../services/customer.service';
import {AuthService} from '../../services/auth.service';
import {EmployeesService} from '../../services/employees.service';

@Component({
  selector: 'app-data-delete',
  templateUrl: './data-delete.component.html',
  styleUrls: ['./data-delete.component.sass']
})
export class DataDeleteComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private stockService: StockDataService,
    private supplierService: SupplierService,
    private customerService: CustomerService,
    private employeeService: EmployeesService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<DataDeleteComponent>
  ) { }

  ngOnInit(): void {
  }

  confirmDelete(deleteData: any): void {
    const id = deleteData.itemId;
    const item = deleteData.item;

    switch (item) {
      case 'product': {
        this.stockService.removeFromShop(id, this.data.shopId).subscribe((response) => {
          if (response) {
            this.dialogRef.close('true');
          }
        });
        break;
      }
      case 'supplier': {
        this.supplierService.removeSupplier(id).subscribe((response) => {
          if (response) {
            this.dialogRef.close('deleted');
          }
        });
        break;
      }
      case 'customer': {
        this.customerService.removeCustomer(id).subscribe((response) => {
          if (response) {
            this.dialogRef.close('deleted');
          }
        });
        break;
      }
      case 'employee': {
        this.employeeService.removeEmployee(id).subscribe((result) => {
          if (result) {
            this.dialogRef.close('deleted');
          }
        });
      }
    }
  }
}
