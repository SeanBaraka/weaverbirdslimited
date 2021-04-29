import { Component, OnInit } from '@angular/core';
import {ShopManagerService} from '../../services/shop-manager.service';
import {StockDataService} from '../../services/stock-data.service';
import {ProductSaleService} from '../../services/product-sale.service';

@Component({
  selector: 'app-shop-product-sale',
  templateUrl: './shop-product-sale.component.html',
  styleUrls: ['./shop-product-sale.component.sass']
})
export class ShopProductSaleComponent implements OnInit {

  // 1. we have to get the sales, for this particular shop
  // 2. get the individual products from the receipts.
  // 3. we should come up with a new list of products with selling prices and the sold units.
  // whereby the sold units will the the number of times the product appears in a receipt;

  shop: any;
  productSales: any[] = [];
  constructor(
    private shopManager: ShopManagerService,
    private productService: ProductSaleService
  ) {
    // we get the shop here..
    this.shopManager.getShopSaved().subscribe((shop) => {
      this.shop = shop;
    });
  }

  ngOnInit(): void {
    this.getSales();
  }
  // get the receipts for the shops
  getSales(): void {
    let productsList: any[] = [];
    let productItemList: any[] = []; // will hold the product ids, and the number of times that they appear;
    this.productService.getSales(this.shop.id).subscribe((receipts: any[]) => {
      receipts.forEach((item) => {
        // we are getting the total sale items from the receipts
        item.saleItems = Array.from(JSON.parse(item.saleItems));
        item.saleItems.forEach((product) => {
          productsList = [...productsList, product];
        });
      });
      // find one product from the list of products obtained above
      productsList.forEach((prod: any) => {
        const itemExists = productItemList.findIndex(x => x.id === prod.id);
        if (itemExists === -1) {
          productItemList.push(prod);
        } else {
          productItemList.find(x => x.id === prod.id).quantity ++;
        }
      });
      console.log(productItemList);
      this.productSales = productItemList;
    });

  }
}
