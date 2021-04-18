import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.sass']
})
export class BackButtonComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  /** navigate Back.. just that, no nothing, just back navigation */
  navigateBack(): void {
    this.router.navigate(['admin']);
  }

}
