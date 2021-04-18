import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-superuser-setup',
  templateUrl: './superuser-setup.component.html',
  styleUrls: ['./superuser-setup.component.sass']
})
export class SuperuserSetupComponent implements OnInit {
  loading = false;
  successMessage: any

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  // form object, I can't remember what they are called in angular
  // something in the lines of reactive forms or something.
  // comming from the form builder. ayeh!!
  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: ['', Validators.required]
  })

  userRoles = []

  ngOnInit(): void {
    this.getAvailableRoles();
  }

  // while registering, populate the list of available user roles
  getAvailableRoles(): void {
    this.authService.getUserRoles().subscribe((roles) => {
      if (roles) {
        this.userRoles = roles;
      }
    })
  }
  // after one has finished creating the user account, proceed to register.
  completeRegistration(): void {
    this.loading = true;
    this.authService.registerUser(this.registerForm.value).subscribe((response) => {
      if (response) {
        this.successMessage = response.success
        this.loading = false;
        this.registerForm.reset()
      }
    })
  }

}
