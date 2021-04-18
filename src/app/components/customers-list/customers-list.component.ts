import { Component, OnInit } from '@angular/core';
import {CustomerService} from '../../services/customer.service';
import {MatDialog} from '@angular/material/dialog';
import {CreateCustomerComponent} from '../create-customer/create-customer.component';

@Component({
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.sass']
})
export class CustomersListComponent implements OnInit {
  customers: any[] = [];

  constructor(private customerService: CustomerService,
              private dialog: MatDialog) { }

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
}
