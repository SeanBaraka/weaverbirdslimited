import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StockDataService} from '../../services/stock-data.service';
import {ProductSaleService} from '../../services/product-sale.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ShopManagerService } from 'src/app/services/shop-manager.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-clear-invoice',
  templateUrl: './clear-invoice.component.html',
  styleUrls: ['./clear-invoice.component.sass']
})
export class ClearInvoiceComponent implements OnInit {

  loading = false;
  shop: any;

  paymentMethod = {
    cash: true,
    mobile: false,
  };

  checkingStatus: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public invoice: any,
    private thisDialog: MatDialogRef<ClearInvoiceComponent>,
    private productSaleService: ProductSaleService,
    private shopManager: ShopManagerService,
    private fb: FormBuilder
  ) { 
    shopManager.getShopSaved().subscribe((result) => {
      this.shop = result;
    })
  }

  cashForm = this.fb.group({
    cashReceived: ['', Validators.required]
  });

  cashBalance = 0;

  ngOnInit(): void {
  }

  clearInvoice(): void {
    this.loading = true;
    const paymentDetails = {};
  }

  cashPayment(): void {
    this.paymentMethod.cash = true;
    this.paymentMethod.mobile = !this.paymentMethod.cash;
  }

  mobilePayment(): void {
    this.paymentMethod.mobile = true;
    this.paymentMethod.cash = !this.paymentMethod.mobile;
  }

  finalizeSale(amount?: number, transactionCode?: string): void {
    let paymentMethod;
    let customer;
    let transactionId;
    // check the payment method options
    switch (this.paymentMethod.cash) {
      case true: {
        paymentMethod = 'CASH';
        // transactionAmount = this.cashForm.get('cashReceived').value
        break;
      }
    }

    switch (this.paymentMethod.mobile) {
      case true: {
        paymentMethod = 'MOBILE';
        transactionId = transactionCode ? transactionCode : "PAKD234KLk";
        customer = 'customer';
        break;
      }
    }

    // const sellAmount = this.invoice.saleAmount;
    const amountTendered = this.cashForm.get('cashReceived').value;
    let amountReceived = amount ? amount : 0;

    const sellOrder = {
      amountReceived: amountTendered,
      paymentMethod,
      transactionId,
    };

    this.productSaleService.clearInvoiceSale(this.invoice.receiptNumber, sellOrder).subscribe((response) => {
      this.loading = false;
      if (response) {
        this.thisDialog.close(response);
      }
    });
  }
}
