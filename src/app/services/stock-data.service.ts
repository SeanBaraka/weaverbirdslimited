import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class StockDataService {

  constructor(private http: HttpClient) { }

  getShopData(name: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}shops/id`, name);
  }

  getDepartments(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}departments/all`)
  }

  /** create a new shop */
  addShop(shopData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}shops/new`, shopData);
  }

  /** get all available shops */
  getShops(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}shops`);
  }

  /** Open the desired Shop */
  openShop(stockData: any, shopId: number): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}shops/open/${shopId}`, stockData);
  }

  /** Gets the days stock based on the date */
  getDaysStock(shopId: number, date: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}shops/stock/${shopId}`, {date});
  }

  /** get shop stock */
  getShopStock(shopId: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}stock/store/${shopId}`);
  }

  /** remove stock item */
  removeFromShop(itemId: number, shopId: number): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}stock/store/${shopId}`, {itemId});
  }

  /** add new product to the selected store */
  addNewProduct(product: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}products/inventory/add`, product);
  }

  /** get shop categories */
  getShopCategories(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}shops/categories`);
  }

  /** an attempt to close the desired shop */
  closeShop(shopId: number, stockInfo: any, openingAmount: any, closingAmount: any, addedStockAmount: any): Observable<any> {
    return this.http.post(
      `${environment.apiBaseUrl}shops/close/${shopId}`,
      {stocks: stockInfo, openingStock: openingAmount, closingStock: closingAmount, addedStock: addedStockAmount });
  }

  /** get stock reports */
  stockReport(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}stock/report`);
  }

  getSuppliers(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}supplier/all`);
  }
}
