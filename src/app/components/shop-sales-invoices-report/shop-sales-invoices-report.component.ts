import { Component, OnInit } from '@angular/core';
import {ShopManagerService} from '../../services/shop-manager.service';
import {ProductSaleService} from '../../services/product-sale.service';

@Component({
  selector: 'app-shop-sales-invoices-report',
  templateUrl: './shop-sales-invoices-report.component.html',
  styleUrls: ['./shop-sales-invoices-report.component.sass']
})
export class ShopSalesInvoicesReportComponent implements OnInit {

  shopInvoices: any[] = [];
  currentShop;
  constructor(private shopService: ShopManagerService, private salesService: ProductSaleService) {
  }

  getInvoices(): void {
    this.shopService.getShopSaved().subscribe((shop) => {
      this.salesService.getInvoiceSales(shop.id).subscribe((invoices: any[]) => {
        invoices.forEach((invoice) => {
          invoice.date = new Date(invoice.date).toLocaleDateString('en-GB');
        });
        this.shopInvoices = invoices;
      });
    });
  }

  ngOnInit(): void {
    this.getInvoices();
  }

  updateInvoices($event: any[]): void {
    this.shopInvoices = $event;
  }
}
