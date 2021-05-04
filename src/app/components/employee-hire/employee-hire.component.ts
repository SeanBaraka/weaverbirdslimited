import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, Validators} from '@angular/forms';
import {EmployeesService} from '../../services/employees.service';
import {AuthService} from '../../services/auth.service';
import {StockDataService} from '../../services/stock-data.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-employee-hire',
  templateUrl: './employee-hire.component.html',
  styleUrls: ['./employee-hire.component.sass']
})
export class EmployeeHireComponent implements OnInit {

  loading = false;
  successMessage: any;
  shops: any[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeesService,
    private authService: AuthService,
    private shopsService: StockDataService,
    private employeeHireDialog: MatDialogRef<EmployeeHireComponent>,
    @Inject(MAT_DIALOG_DATA) private userInfo: any
  ) { }

  // form object, I can't remember what they are called in angular
  // something in the lines of reactive forms or something.
  // coming from the form builder. ayeh!!
  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    shopId: ['', Validators.required]
  });

  userRoles = [];

  ngOnInit(): void {
    this.getAvailableRoles();
    this.getAvailableShops();

    if (this.userInfo !== null) {
      this.registerForm.get('firstName').setValue(this.userInfo.firstName);
      this.registerForm.get('lastName').setValue(this.userInfo.lastName);
      this.registerForm.get('username').setValue(this.userInfo.username);
    }
  }

  // while registering, populate the list of available user roles
  getAvailableRoles(): void {
    this.authService.getUserRoles().subscribe((roles) => {
      if (roles) {
        this.userRoles = roles;
      }
    });
  }
  // after one has finished creating the user account, proceed to register.
  completeRegistration(): void {
    let employeeId;
    this.userInfo !== null ? employeeId = this.userInfo.id : employeeId = -1;
    this.loading = true;
    const shop = this.shops.find(x => x.name === this.registerForm.get('shopId').value);
    this.registerForm.get('shopId').setValue(shop.id);
    this.employeeService.hireEmployee(this.registerForm.value, employeeId).subscribe((response) => {
      if (response) {
        this.successMessage = response.success;
        this.loading = false;
        this.registerForm.reset();
        this.employeeHireDialog.close('true');
      }
    });
  }

  /** get all shops first */
  getAvailableShops(): void {
    this.shopsService.getShops().subscribe((response) => {
      if (response) {
        response.departments = [
          { "name" : "POS" },
          {"name": "Accounting"}
        ]
        this.shops = response;
      }
    });
  }

  // checkBoxChange(e: any): void {
  //   const shops = this.registerForm.get('shops') as FormArray;
  //   if (e.target.checked) {
  //     shops.push(new FormControl(e.target.value));
  //   } else {
  //     let index = 0;
  //     shops.controls.forEach((control) => {
  //       if (control.value === e.target.value) {
  //         shops.removeAt(index);
  //         return;
  //       }
  //       index ++;
  //     });
  //   }
  // }

}
