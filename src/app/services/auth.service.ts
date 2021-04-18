import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  /** checks if a user is authenticated. returns a boolean value
   * for the result.
   */
  isAuthenticated(): boolean {
    const jwt = new JwtHelperService();
    const token = localStorage.getItem('appId');
    if (token != null) {
      return !jwt.isTokenExpired(token);
    }
    return false;
  }

  registerUser(registrationData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}auth/register`, registrationData);
  }


  /** attempt login */
  authenticate(userData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}auth/login`, userData );
  }

  /** saves the user instance to the system */
  saveUser(token: string): void {
    return localStorage.setItem('appId', token);
  }

  /** get user data */
  getUserData(): any {
    const jwt = new JwtHelperService();
    const token = localStorage.getItem('appId');

    return jwt.decodeToken(token);
  }

  /** get token */
  getToken(): string {
    return localStorage.getItem('appId');
  }

  /** logout user */
  removeUser(): void {
    localStorage.removeItem('appId');
  }

  /** check wheather a super user exists */
  checkSuperUser(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}auth/checkadmin`);
  }

  /** get user roles from the api */
  getUserRoles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}auth/roles`);
  }

}
