import { Component, OnInit } from '@angular/core';
import { ProductSaleService } from 'src/app/services/product-sale.service';
import {RealTimeDataService} from "../../services/real-time-data.service";
import { io } from 'socket.io-client'
import { environment } from 'src/environments/environment';
import { ShopManagerService } from 'src/app/services/shop-manager.service';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.sass']
})
export class FinanceComponent implements OnInit {

  constructor(
    private dataService: RealTimeDataService,
    private salesService: ProductSaleService,
    private shopManager: ShopManagerService
  ) {
    shopManager.getShopSaved().subscribe((result) => {
      this.shop = result;
    })
   }

  shop: any;
  cashSales = 0;
  mobileSales = 0;
  bankSales = 0;
  chequeSales = 0;
  invoices = 0;
  mpesaBalance = 0;

  // checks wheather the socket io server is connected to us over here.
  connected = io(environment.socketUrl).connected;


  ngOnInit(): void {
    this.dataService.getAccountBalance((response) => {
      this.mpesaBalance = response;
    });
    this.getSales();
  }

  /** we create a list that holds the sales transaction of a particular payment method */
  transactionSales: any[] = [];
  // I have to simplify things around here, i.e. get the sales for each transaction first.
  mpesaTransactions: any[];
  invoiceTransactions: any[];
  cashTransactions: any[];
  bankTransactions: any[];


  /** a list of all sales recorded */
  allSales: any[];
  // getting all sales and assigning them to our list of all sales.
  getSales(): void {
    this.salesService.getSales(this.shop.id).subscribe((response: any[]) => {
      
      response.forEach((sale) => {
        sale.date = new Date(sale.date)
        sale.shop = sale.shop.name;
      });
      
      this.allSales = response;
      this.cashTransactions = this.filterSales('CASH', this.allSales)
      this.mpesaTransactions = this.filterSales('MOBILE', this.allSales)
      this.invoiceTransactions = this.filterSales('INVOICE', this.allSales)
      this.bankTransactions = this.filterSales('BANK', this.allSales)
      this.cashSales = this.computeTotalSales(this.cashTransactions)
      this.mobileSales = this.computeTotalSales(this.mpesaTransactions)
      this.invoices = this.computeTotalSales(this.invoiceTransactions)
      this.bankSales = this.computeTotalSales(this.bankTransactions)
      this.toggleAccount('CASH');
    });
  }

  // filter sales based on the payment method.
  filterSales(method: string, saleRecords?: any[]): any[] {
    const sales = saleRecords.filter(sale => sale.paymentMethod.toLowerCase() === method.toLowerCase())

    return sales;
  }

  /** a toggle feature for the various payment methods */
  toggleAccount(accountType: any): void {
    switch (accountType) {
      case 'INVOICE':
        this.transactionSales = this.invoiceTransactions
        break;
      case 'MOBILE':
        this.transactionSales = this.mpesaTransactions
        break;
      case 'BANK':
        this.transactionSales = this.bankTransactions
        break;
      default:
        this.transactionSales = this.cashTransactions
        break;
    }
  }

  computeTotalSales(sales: any[]): number {
    if (sales.length <= 0) {
      return 0;
    }
    const amounts = [];
    sales.forEach((sale) => amounts.push(sale.saleAmount))

    return amounts.reduce((a, b) => a + b);
  }

  updateSales(event: any[]): void {    
    this.allSales = event;
    this.cashTransactions = this.filterSales('CASH', event);
    this.mpesaTransactions = this.filterSales('MOBILE', event);
    this.invoiceTransactions = this.filterSales('INVOICE', event);
    this.bankTransactions = this.filterSales('BANK', event);
    this.cashSales = this.computeTotalSales(this.cashTransactions);
    this.mobileSales = this.computeTotalSales(this.mpesaTransactions)
    this.invoices = this.computeTotalSales(this.invoiceTransactions)
    this.bankSales = this.computeTotalSales(this.bankTransactions)
  }
}
