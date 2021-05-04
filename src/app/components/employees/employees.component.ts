import { Component, OnInit } from '@angular/core';
import {EmployeesService} from '../../services/employees.service';
import {MatDialog} from '@angular/material/dialog';
import {DataDeleteComponent} from '../data-delete/data-delete.component';
import {EmployeeHireComponent} from '../employee-hire/employee-hire.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.sass']
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  constructor(
    private employeeService: EmployeesService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getEmployeeRecords();
  }

  // get all employee records
  getEmployeeRecords(): void {
    this.employeeService.getEmployees().subscribe((response) => {
      this.employees = response;
    });
  }

  updateUser(employee: any): void {
    this.dialog.open(EmployeeHireComponent, {
      width: '840px',
      data: employee
    }).afterClosed().subscribe((result) => {
      if (result === 'true') {
        this.getEmployeeRecords();
      }
    });
  }

  deleteUser(id: number): void {
    this.dialog.open(DataDeleteComponent, {
      width: '540px',
      data: {
        itemId: id,
        item: 'employee'
      }
    }).afterClosed().subscribe((result) => {
      if (result === 'deleted') {
        this.getEmployeeRecords();
      }
    });
  }
}
