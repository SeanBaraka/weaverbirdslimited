import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {CustomerService} from '../../services/customer.service';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.sass']
})
export class CreateCustomerComponent implements OnInit {
  customerForm = this.fb.group({
    name: ['', Validators.required],
    telephone: [''],
    location: ['']
  });

  constructor(private fb: FormBuilder,
              private customerService: CustomerService,
              private dialogRef: MatDialogRef<CreateCustomerComponent>) { }

  ngOnInit(): void {
  }

  addCustomer(): void {
    const customerData = this.customerForm.value;
    this.customerService.saveCustomer(customerData).subscribe((response) => {
      if (response) {
        this.dialogRef.close('success');
        this.customerForm.reset();
      }
    },
      error => console.error);
  }
}
