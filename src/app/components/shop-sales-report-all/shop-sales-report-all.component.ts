import { Component, OnInit } from '@angular/core';
import { ProductSaleService } from 'src/app/services/product-sale.service';
import {ShopManagerService} from '../../services/shop-manager.service';

@Component({
  selector: 'app-shop-sales-report-all',
  templateUrl: './shop-sales-report-all.component.html',
  styleUrls: ['./shop-sales-report-all.component.sass']
})
export class ShopSalesReportAllComponent implements OnInit {

  // all sales
  sales: any[];
  shop: any;

  constructor(private salesService: ProductSaleService, private shopManager: ShopManagerService) { }

  ngOnInit(): void {
    this.getShopSalesReport();
  }

  getShopSalesReport(): void {
    this.shopManager.getShopSaved().subscribe((shopResponse) => {
      this.shop = shopResponse;
      this.getSales(shopResponse.id);
    })
  }

  /** get all sales records for this particular shop */
  getSales(shopId: number): void {
    this.salesService.getSales(shopId).subscribe((response: any[]) => {
      response.forEach((sale) => {
        sale.date = new Date(sale.date).toLocaleDateString('en-GB')
      })
      this.sales = response;
    })
  }

  /** print all sales */
  reprintReceipt(receiptId: number): void {

  }

}
