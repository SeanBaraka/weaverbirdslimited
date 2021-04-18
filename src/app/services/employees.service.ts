import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor(private http: HttpClient) { }

  /** hire employee.
   * @param personalInfo - personal details
   */
  hireEmployee(personalInfo: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}employees/hire/`, personalInfo);
  }

  /** get all employee records */
  getEmployees(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}employees`);
  }

}
