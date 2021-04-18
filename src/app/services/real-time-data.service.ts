import { Injectable } from '@angular/core';
import { SelectControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';
import {io, Socket} from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RealTimeDataService {
  socket: Socket;
  constructor() {
    this.startConnection();
  }

  getAccountBalance(balanceResult): any {
    this.socket.on('accouuntBalance', (data) => {
      return balanceResult(data);
    });
  }

  /** starts the connection to the socket io server */
  startConnection(): any {
    if (this.socket == null || this.socket == undefined) {
      this.socket = io(environment.socketUrl);
      return this.socket
    } else {
      return this.socket
    }
  }

  /** check if the connection was established */
  serverConnected(): boolean {
    console.log('from the rt service',this.socket)
    return this.socket.connected
  }

  /** get the confirmed transaction details */
  getTransactionDetails(success): any {
    this.socket.on('paymentConfirmed', (response: any) => {
     return response ? success(response) : null
    })
  }

  getMobileMoneyBalance(balance): any {
    this.socket.on('updateBalance', (response: any) => {
      return response ? balance(response) : null
    })
  }
}
