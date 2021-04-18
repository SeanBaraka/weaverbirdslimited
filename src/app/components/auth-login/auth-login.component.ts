import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.sass']
})
export class AuthLoginComponent implements OnInit {
  adminPresent: boolean;
  authLogin = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  // loading and error state variables
  loading = false;
  errorConnecting = false;

  // login error message
  errorLogin: any;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit(): void {
    this.checkForSuperUser(); // execute the checking for admin on initialization
  }

  // before everything else, check if a super user exists
  checkForSuperUser(): void {
    this.authService.checkSuperUser().subscribe(
      (isPresent: any) => {
        if (isPresent.status === true) {
          this.adminPresent = true;
        } else {
          this.adminPresent = false;
        }
      }
    );
  }

  loginAttempt(): void {
    this.loading = true;
    this.authService.authenticate(this.authLogin.value).subscribe((response) => {
      console.log(response)
      if (response) {
        this.authLogin.reset();
        this.loading = false;
        if (response.token) {
          this.authService.saveUser(response.token);
          const userData = this.authService.getUserData();
          console.log(userData);
          if (userData.isa || userData.issa) {
            this.router.navigate(['admin']);
          }
          else {
            this.router.navigate(['']);
          }
        }
      }
    }, (error) => {
      console.log('err', error);

      if (error.status !== 404) {
        this.loading = false;
        this.errorConnecting = true;
      } else {
        this.errorLogin = error.error;
        this.loading = false;
        this.authLogin.reset();
        this.errorConnecting = false;
      }
    });
  }

  retryEntry(): void {
    this.errorConnecting = false;
    this.loading = false;
  }

}
