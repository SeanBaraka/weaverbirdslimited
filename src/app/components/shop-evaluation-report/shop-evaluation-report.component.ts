import { Component, OnInit } from '@angular/core';
import {ProductSaleService} from '../../services/product-sale.service';
import {ShopManagerService} from '../../services/shop-manager.service';

@Component({
  selector: 'app-shop-evaluation-report',
  templateUrl: './shop-evaluation-report.component.html',
  styleUrls: ['./shop-evaluation-report.component.sass']
})
export class ShopEvaluationReportComponent implements OnInit {
  dateSelected = true;
  psales = false;
  btow = true;
  message: any;
  productSales: any[];
  shop: any;

  constructor(
    private productService: ProductSaleService,
    private shopManager: ShopManagerService,
  ) {
    shopManager.getShopSaved().subscribe((result) => {
      this.shop = result;
    });
  }

  ngOnInit(): void {
    this.getSales();
  }

  selectDateBTW(): void {
    this.dateSelected = true;
    this.message = 'Best to Worst Summary.';
    this.btow = true;
    this.psales = false;
  }

  selectDatePS(): void {
    this.dateSelected = true;
    this.message = 'Profit Sale Summary.';
    this.psales = true;
    this.btow = false;
  }

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
      this.productSales = productItemList;
    });

  }
}
