import { Component, OnInit } from '@angular/core';
import {CustomerService} from '../../services/customer.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CreateCustomerComponent} from '../create-customer/create-customer.component';
import {DataDeleteComponent} from '../data-delete/data-delete.component';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.sass']
})
export class CustomersListComponent implements OnInit {
  customers: any[] = [];

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.getCustomerList();
  }

  getCustomerList(): void {
    this.customerService.getCustomers().subscribe((response: any[]) => {
      response.forEach((item) => {
        if (item.saleRecords !== undefined) {
          item.saleRecords = item.saleRecords.length;
        }
        item.saleRecords = 0;
      })
      this.customers = response;
    });
  }

  filterSalesControl(value: any): void {

  }

  addCustomerModalOpen(): void {
    this.dialog.open(CreateCustomerComponent, {
      width: '720px',
      height: 'auto'
    }).afterClosed().subscribe((data) => {
      this.getCustomerList();
    });
  }

  updateCustomer(customer: any): void {

  }

  deleteCustomer(id: number): void {
    this.dialog.open(DataDeleteComponent, {
      width: '540px',
      data: {
        itemId: id,
        item: 'customer'
      }
    }).afterClosed().subscribe((result) => {
      if (result === 'deleted') {
        this.getCustomerList();
      }
    });
  }
}
