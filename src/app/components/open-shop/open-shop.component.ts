import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {Product} from "../../interfaces/product";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProductsManagementService} from "../../services/products-management.service";
import {StockDataService} from "../../services/stock-data.service";
import {MessageNotificationsService} from "../../services/message-notifications.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-open-shop',
  templateUrl: './open-shop.component.html',
  styleUrls: ['./open-shop.component.sass']
})
export class OpenShopComponent implements OnInit {

  constructor( private dialogRef: MatDialogRef<OpenShopComponent>,
               private stockService: StockDataService,
               private prodService: ProductsManagementService,
               private messageNotifications: MessageNotificationsService,
               private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) { }

  stockProducts: Array<any> = [];
  availableProducts: Array<any> = [];
  openingStock = 0;
  productPrice = 0;

  addStockForm = this.fb.group({
    name: ['', Validators.required],
    unitPrice: [''],
    availableUnits: ['', Validators.required]
  });

  ngOnInit(): void {
    this.getProducts();
  }

  /** attempt to get all products from the database */
  getProducts(): void {
    this.prodService.listProducts().subscribe((data: Product[]) => {
      this.availableProducts = data;
    });
  }

  updateStock(): void {
    this.addStockForm.get('unitPrice').setValue(this.productPrice);
    this.stockProducts.push(this.addStockForm.value);
    this.openingStock = this.getOpeningStockTotal(this.stockProducts);
    this.addStockForm.reset();
  }

  saveStockData(): void {
    const totalOpeningStock = this.getOpeningStockTotal(this.stockProducts);
    this.stockService.openShop(this.stockProducts, this.data.shopId).subscribe(data => {
      if (data) {
        const message = {
          recipients: environment.recipients,
          message: `Hello Peter, ${data.success}`
        };

        this.messageNotifications.sendMessage(message).subscribe((response: any) => {
          console.log(response.message);
        });
        this.dialogRef.close('openSuccess');
      }
    });
  }

  getOpeningStockTotal(stockProducts: Array<Product>): number {
    // get the openning stock values;
    const totalValuesArray = [];
    // tslint:disable-next-line:only-arrow-functions
    stockProducts.forEach((item)  => {
      const subTotal = item.unitPrice * item.openingUnits;
      totalValuesArray.push(subTotal);
    });

    return totalValuesArray.reduce((a, b) => a + b, 0);

  }

  checkPrice(value: any): void {
    const product = this.availableProducts.filter(x => x.name === value).pop();
    this.productPrice = product.unitPrice;
  }
}
