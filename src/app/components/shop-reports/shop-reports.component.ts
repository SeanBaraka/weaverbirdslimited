import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShopManagerService } from 'src/app/services/shop-manager.service';

@Component({
  selector: 'app-shop-reports',
  templateUrl: './shop-reports.component.html',
  styleUrls: ['./shop-reports.component.sass']
})
export class ShopReportsComponent implements OnInit {

  shop: any;
  constructor(
    private router: Router,
    private shopManager: ShopManagerService) {

  }

  ngOnInit(): void {
    this.shopManager.getShopSaved().subscribe((shop) => {
      // see if we have registered the shop on the client
      this.shop = shop;
    })
  }

  navigateBack(): void {
    this.router.navigate(['admin', 'shop'], {
      state: {
        shop: this.shop
      }
    })
  }

}
