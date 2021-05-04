import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import { RealTimeDataService } from './real-time-data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductSaleService {

  constructor(private http: HttpClient, private rtdata: RealTimeDataService) { }

  makeSale(shopId: number, saleRecordData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}shops/${shopId}/sale/`, saleRecordData);
  }

  getSales(shopId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}shops/${shopId}/sales/total/`);
  }

  // geet all sales, and not just one shop as the above method states
  getAllSales(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}sales/all`);
  }

  getCustomers(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}customers/list`);
  }

  getInvoiceSales(shopId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}shop/${shopId}/sales/invoices`)
  }

  clearInvoiceSale(invoiceNumber: number, paymentDetails: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}sales/invoices/clear/${invoiceNumber}`, paymentDetails);
  }

  /** gets mpesa transaction details */
  mobilePaymentConfirmation(paymentInfo: any): boolean {
    let success:boolean;
    this.rtdata.getTransactionDetails((response) => {
      console.log(response);
      success = true;
    });
    return success;
  }
}
