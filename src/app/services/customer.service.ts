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
   * @param { } - the customer details object
   */
  saveCustomer(customerDetails: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}customer/add`, customerDetails);
  }
}
