import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MakePurchaseComponent} from '../make-purchase/make-purchase.component';
import {ShopManagerService} from '../../services/shop-manager.service';
import { StockDataService } from 'src/app/services/stock-data.service';

@Component({
  selector: 'app-purchases',
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.sass']
})
export class PurchasesComponent implements OnInit {
  purchases: any[] = []; // holds a list of all purchases from the database
  shop: any;

  constructor(
    private dialog: MatDialog,
    private shopManager: ShopManagerService,
    private stockService: StockDataService) { }

  ngOnInit(): void {
    this.shopManager.getShopSaved().subscribe((shop) => {
      this.shop = shop
      this.getPurchaseRecords(this.shop.id)
    })
  }

  getPurchaseRecords(shopId: number): void {
    this.stockService.getShopPurchaseOrders(shopId).subscribe((orders: any[]) => {
      orders.forEach((item) => {
        item.generatedAt = new Date(item.generatedAt).toLocaleDateString()
      })
      this.purchases = orders;
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
    }).afterClosed().subscribe(data => {
      console.log(data)
      this.getPurchaseRecords(data);
    });
  }
}
