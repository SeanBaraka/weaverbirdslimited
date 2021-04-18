import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PersonnelStaffService {

  constructor(private http: HttpClient) { }

  addPersonnel(staffData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}personnel/new`, staffData);
  }

  getPersonnel(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}personnel/list`);
  }
}
