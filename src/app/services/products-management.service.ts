import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductsManagementService {

  constructor(private http: HttpClient) { }

  /** attempts to add a product to the database store */
  insertProduct(productData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}products/new/`, productData);
  }

  /** transfer products from shop to shop */
  transferProducts(productData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}stock/moveproducts`, productData);
  }

  /** retrieves a list of all products from the database */
  listProducts(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}products`);
  }

}
