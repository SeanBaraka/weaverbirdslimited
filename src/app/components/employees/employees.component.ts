import { Component, OnInit } from '@angular/core';
import {EmployeesService} from '../../services/employees.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.sass']
})
export class EmployeesComponent implements OnInit {
  employees: any[] = [];
  constructor(private employeeService: EmployeesService) { }

  ngOnInit(): void {
    this.getEmployeeRecords();
  }

  // get all employee records
  getEmployeeRecords(): void {
    this.employeeService.getEmployees().subscribe((response) => {
      this.employees = response;
    });
  }

}
