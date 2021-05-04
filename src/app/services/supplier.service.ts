import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(private http: HttpClient) { }

  getSupplierList(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}supplier/all`)
  }

  addSupplier(supplierInfo: any, supplierId?: number): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}supplier/add/${supplierId}`, supplierInfo);
  }

  removeSupplier(supplierId: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}supplier/remove/${supplierId}`);
  }
}
