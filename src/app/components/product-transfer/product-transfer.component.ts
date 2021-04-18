import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ProductsManagementService } from 'src/app/services/products-management.service';
import { StockDataService } from 'src/app/services/stock-data.service';

@Component({
  selector: 'app-product-transfer',
  templateUrl: './product-transfer.component.html',
  styleUrls: ['./product-transfer.component.sass']
})
export class ProductTransferComponent implements OnInit {
  transferForm = this.fb.group({
    productId: [''],
    destinationShopId: ['', Validators.required],
    sourceShopId: ['', Validators.required],
    quantity: ['', Validators.required],
    shopName: ['']
  });

  availableShops: any[] = []

  outputMessage: any;

  constructor(
    private fb: FormBuilder,
    private productManagement: ProductsManagementService,
    private shopService: StockDataService,
    private thisDialog: MatDialogRef<ProductTransferComponent>,
    @Inject(MAT_DIALOG_DATA) public transferData: any
  ) { }

  ngOnInit(): void {
    this.getAvailableShops();
    this.transferForm.get('productId').setValue(this.transferData.product.id)
    this.transferForm.get('sourceShopId').setValue(this.transferData.shopId)
  }

  updateShopId(shopName: string): void {
    const shop = this.availableShops.find(x => x.name.toLowerCase() == shopName.toLowerCase())
    this.transferForm.get('destinationShopId').setValue(shop.id)
    console.log(this.transferForm.value)
  }

  getAvailableShops(): void {
    this.shopService.getShops().subscribe((shops: any[]) => {
      this.availableShops = shops.filter(x => x.id != this.transferData.shopId )
    })
  }

  completeTransfer(): void { 
    this.productManagement.transferProducts(this.transferForm.value).subscribe((response) => {
      this.outputMessage = response.success
      setTimeout(() => {
        this.thisDialog.close('true')
      }, 2000);
    })
  }
}
