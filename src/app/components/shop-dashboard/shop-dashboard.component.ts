import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ShopManagerService } from 'src/app/services/shop-manager.service';
import { StockDataService } from 'src/app/services/stock-data.service';
import { ProductsSaleComponent } from '../products-sale/products-sale.component';
import {AddStockProductComponent} from '../add-stock-product/add-stock-product.component';
import {MakePurchaseComponent} from '../make-purchase/make-purchase.component';

@Component({
  selector: 'app-shop-dashboard',
  templateUrl: './shop-dashboard.component.html',
  styleUrls: ['./shop-dashboard.component.sass']
})
export class ShopDashboardComponent implements OnInit {

  stockProducts: any = []
  shop: any;
  items = [
    {title: 'POS', image: 'credit-card-machine.svg'},
    {title: 'Invoices', image: 'invoice.svg'},
    {title: 'Purchases', image: 'supply.svg'},
    {title: 'Quotations', image: 'payment.svg'},
    {title: 'Stock', image: 'stock-image.svg'},
    {title: 'Reports', image: 'report.svg'},
    {title: 'Cash Summary', image: 'money.png'},
    {title: 'Expenses & Gifts', image: 'market.svg'}
  ]

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private stockData: StockDataService,
    private shopManagerService: ShopManagerService) { }

  ngOnInit(): void {
    // this.shop = history.state.shop;
    // console.log(`currently at ${JSON.stringify(this.shop)}`);
    this.getCurrentShop();
    // this.getShopProducts();
  }

  getCurrentShop() {
    this.shopManagerService.getShopSaved().subscribe((currentShop) => {
      if (currentShop !== undefined) {
        this.shop = currentShop;
        this.getShopProducts() // get the shop products and stuff..
      }
    })
  }

  getShopProducts(): void {
    this.stockData.getShopStock(this.shop.id).subscribe((products) => {
      if (products) {
        this.stockProducts = products;
      }
    });
  }

  navigateToDestination(item: any): void {
    switch (item.title) {
      case 'POS':
        this.dialog.open(ProductsSaleComponent, {
          width: '90%',
          height: '540px',
          data: {shopId: this.shop.id, stockProducts: this.stockProducts, shopName: this.shop.name}
        }).afterClosed().subscribe((data) => {
          if (data) {
            // this.getShopStock();
          }
        });
        break;

      // Opens the POS dialog box, while open, the window should
      // be focused on the invoice section of the sale.
      case 'Invoices':
        this.dialog.open(ProductsSaleComponent, {
          width: '90%',
          height: '540px',
          data: {shopId: this.shop.id, stockProducts: this.stockProducts, shopName: this.shop.name, invoice: true }
        }).afterClosed().subscribe((data) => {
          if (data) {
            // this.getShopStock();
          }
        });
        break;

      case 'Stock':
        this.router.navigate(['dashboard','stock'], {
          state: {
            shop: this.shop,
            simpleShop: true,
            openStatus: this.shop.openStatus
          }
        });
        break;

      case 'Reports':
        this.router.navigate(['dashboard', 'reports']);
        break;

      case 'Cash Summary':
        this.router.navigate(['dashboard', 'finance']);
        break;

      case 'Purchases':
        this.router.navigate(['dashboard', 'purchases']);
        break;

      default:
        break;
    }
  }

  navigateBack(): void {
    this.router.navigate(['admin'])
  }

}
