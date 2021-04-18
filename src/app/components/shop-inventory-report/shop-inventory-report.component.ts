import { Component, OnInit } from '@angular/core';
import { StockDataService } from 'src/app/services/stock-data.service';

@Component({
  selector: 'app-shop-inventory-report',
  templateUrl: './shop-inventory-report.component.html',
  styleUrls: ['./shop-inventory-report.component.sass']
})
export class ShopInventoryReportComponent implements OnInit {

  shopProducts: any[] =[]
  shop: any;
  constructor(private stockservice: StockDataService) { 
    
  }

  ngOnInit(): void {
    // this.getShopProducts();
  }

  /**gets all products for the particular shop */
  getShopProducts(): void {
    this.stockservice.getShopData(this.shop.name).subscribe((response) => {
        console.log(response)
    })
  }

}
