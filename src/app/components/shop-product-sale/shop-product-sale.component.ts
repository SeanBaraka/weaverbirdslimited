import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shop-product-sale',
  templateUrl: './shop-product-sale.component.html',
  styleUrls: ['./shop-product-sale.component.sass']
})
export class ShopProductSaleComponent implements OnInit {

  productSales: any[] = []
  constructor() { }

  ngOnInit(): void {
  }

}
