import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor(private http: HttpClient) {
  }


  getVehicles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}vehicles/list`);
  }

  addVehicle(vehicleData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}vehicles/new/`, vehicleData);
  }

  addDriverToVehicle(driverVehicleData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}vehicle/driver/`, driverVehicleData);
  }

  addVehicleRoute(routeData: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}vehicles/routes/new/`, routeData);
  }

  getVehicleRoutes(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}vehicles/routes/list`);
  }

  /** Attempt to get the drivers list */
  getDriversList(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}drivers/list`);
  }

  /** Dispatch the vehicle */
  dispatchVehicle(dispatchInfo: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}vehicle/dispatch`, dispatchInfo);
  }

  /** get the vehicles in transist */
  vehiclesInTransist(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}vehicles/in-route`);
  }

  /** get vehicles reports */
  stockReport(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}vehicles/report`);
  }
}
