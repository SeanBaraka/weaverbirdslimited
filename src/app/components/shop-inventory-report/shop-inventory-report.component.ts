import { Component, OnInit } from '@angular/core';
import { StockDataService } from 'src/app/services/stock-data.service';
import {ShopManagerService} from '../../services/shop-manager.service';

@Component({
  selector: 'app-shop-inventory-report',
  templateUrl: './shop-inventory-report.component.html',
  styleUrls: ['./shop-inventory-report.component.sass']
})
export class ShopInventoryReportComponent implements OnInit {

  shopProducts: any[] =[]
  shop: any;
  constructor(private stockservice: StockDataService, private shopManager: ShopManagerService) {
    shopManager.getShopSaved().subscribe((shop) => {
      this.shop = shop;
    });
  }

  ngOnInit(): void {
    this.getShopProducts();
  }

  /** gets all products for the particular shop */
  getShopProducts(): void {
    this.stockservice.getShopStock(this.shop.id).subscribe((response) => {
        this.shopProducts = response;
    });
  }

  getStockTotal(id: any): number {
    const product = this.shopProducts.find((item) => item.id === id);
    let total = 0;
    total = product.costPrice * product.quantity;
    return total;
  }
}
