import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-logged-in',
  templateUrl: './user-logged-in.component.html',
  styleUrls: ['./user-logged-in.component.sass']
})
export class UserLoggedInComponent implements OnInit {
  userLoggedIn = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.getLoggedInUser();
  }

  getLoggedInUser(): void {
    const user = this.authService.getUserData();

    this.userLoggedIn = user.user;
  }

  logout(): void {
    this.authService.removeUser();
    this.router.navigate(['auth','login']);
  }
}
