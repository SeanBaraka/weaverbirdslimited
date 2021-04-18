import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-payment',
  templateUrl: './confirm-payment.component.html',
  styleUrls: ['./confirm-payment.component.sass']
})
export class ConfirmPaymentComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<ConfirmPaymentComponent>
  ) { }

  transaction: any

  ngOnInit(): void {
    this.transaction = this.data
    
  }

  confirmedPayment(amount: number): void {
    const transaction = {
      "status": "confirmed",
      "amount": this.transaction.amount,
      "transactionId": this.transaction.transactionID
    }
    this.dialog.close(transaction)
  }

}
