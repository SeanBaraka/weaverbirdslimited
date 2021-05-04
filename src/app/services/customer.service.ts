import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private http: HttpClient) { }

  /** get all customer records
   * @return Observable<any> an array of customers
   */
  getCustomers(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}customer/list`);
  }

  /** insert a new customer to the database
   * @param customerDetails - the customer details object
   * @param customerId - an optional number passed with the request
   */
  saveCustomer(customerDetails: any, customerId?: number): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}customer/add/${customerId}`, customerDetails);
  }

  removeCustomer(customerId: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}customer/remove/${customerId}`);
  }
}
