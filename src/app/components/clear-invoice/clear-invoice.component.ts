import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StockDataService} from '../../services/stock-data.service';
import {ProductSaleService} from '../../services/product-sale.service';

@Component({
  selector: 'app-clear-invoice',
  templateUrl: './clear-invoice.component.html',
  styleUrls: ['./clear-invoice.component.sass']
})
export class ClearInvoiceComponent implements OnInit {

  loading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public invoice: any,
    private thisDialog: MatDialogRef<ClearInvoiceComponent>,
    private productSaleService: ProductSaleService,
  ) { }

  ngOnInit(): void {
  }

  clearInvoice(): void {
    this.loading = true;
    const paymentDetails = {};
    this.productSaleService.clearInvoiceSale(this.invoice.ordNumber, paymentDetails).subscribe((response) => {
      this.loading = false;
      if (response) {
        this.thisDialog.close('cleared');
      }
    });
  }
}
