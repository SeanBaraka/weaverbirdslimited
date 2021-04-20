import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MakePurchaseComponent} from '../make-purchase/make-purchase.component';
import {ShopManagerService} from '../../services/shop-manager.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.sass']
})
export class PurchasesComponent implements OnInit {
  purchases: any[] = []; // holds a list of all purchases from the database
  shop: any;

  constructor(private dialog: MatDialog, private shopManager: ShopManagerService) { }

  ngOnInit(): void {
    this.shopManager.getShopSaved().subscribe((shop) => {
      this.shop = shop
    })
  }

  filterPurchases(value: any): void {

  }

  makePurchase(): void {
    this.dialog.open(MakePurchaseComponent, {
      width: '720px',
      data: {
        shopId: this.shop.id
      }
    });
  }
}
