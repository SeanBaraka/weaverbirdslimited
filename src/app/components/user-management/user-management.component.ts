import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, Validators} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import {ShopManagerService} from '../../services/shop-manager.service';
import {StockDataService} from '../../services/stock-data.service';
import {EmployeesService} from '../../services/employees.service';
import {MatDialog} from '@angular/material/dialog';
import {EmployeeHireComponent} from '../employee-hire/employee-hire.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.sass']
})
export class UserManagementComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {

  }

  employeeAddModal(): void {
    this.dialog.open(EmployeeHireComponent, {
      width: '840px',
    }).afterClosed().subscribe((data) => this.ngOnInit());
  }
}
