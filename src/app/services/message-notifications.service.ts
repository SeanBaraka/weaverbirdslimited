import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MessageNotificationsService {

  constructor(private http: HttpClient) { }

  sendMessage(message: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}notifications/send`, message);
  }

}
