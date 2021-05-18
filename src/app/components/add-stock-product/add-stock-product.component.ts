import {AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {StockDataService} from "../../services/stock-data.service";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import { ShopManagerService } from 'src/app/services/shop-manager.service';

@Component({
  selector: 'app-add-stock-product',
  templateUrl: './add-stock-product.component.html',
  styleUrls: ['./add-stock-product.component.sass']
})
export class AddStockProductComponent implements OnInit, AfterViewInit {

  shop: any;

  constructor(
    private fb: FormBuilder,
    private stockData: StockDataService,
    private shopmanager: ShopManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    shopmanager.getShopSaved().subscribe((result) => {
      this.shop = result
    })
  }
  productForm = this.fb.group({
    serialNumber: [''],
    name: ['', Validators.required],
    qty: ['', Validators.required],
    costPrice: ['', Validators.required],
    minPrice: ['', Validators.required],
    maxPrice: [''],
    stockqty: [''],
    sellingPrice: ['', Validators.required],
    shopId: [this.data.shopId],
    supplier: ['']
  });

  supplierAvailable = false;
  loading = false;
  successMessage: any;
  selectedProduct;

  @ViewChild('serialNumber') myInputField: ElementRef;
  suppliers: any[];

  ngOnInit(): void {
    if (this.data.product) {
      this.selectedProduct = this.data.product;

      this.productForm.get('serialNumber').setValue(this.selectedProduct.serialNumber);
      this.productForm.get('qty').setValue(this.selectedProduct.quantity);
      this.productForm.get('name').setValue(this.selectedProduct.name);
      this.productForm.get('costPrice').setValue(this.selectedProduct.costPrice);
      this.productForm.get('minPrice').setValue(this.selectedProduct.minPrice);
      this.productForm.get('sellingPrice').setValue(this.selectedProduct.sellingPrice);
      this.productForm.get('maxPrice').setValue(this.selectedProduct.maxPrice);
      this.productForm.get('minPrice').setValue(this.selectedProduct.minPrice);
      this.productForm.get('sellingPrice').setValue(this.selectedProduct.sellingPrice);
      this.productForm.get('stockqty').setValue(this.selectedProduct.physicalStock)
      this.productForm.get('maxPrice').setValue(this.selectedProduct.maxPrice);
    }
    this.getSuppliers();
  }
  ngAfterViewInit(): void {
    this.myInputField.nativeElement.focus();
  }

  // get registered suppliers.
  getSuppliers(): void {
    this.stockData.getSuppliers().subscribe((resp) => {
      this.suppliers = resp;
    });
  }

  addProduct(event: any): void {
    if (this.productForm.valid) {
      this.loading = true;
      this.productForm.get('shopId').setValue(this.shop.id);
      
      this.stockData.addNewProduct(this.productForm.value, this.shop.id).subscribe((response) => {

        if (response) {
          this.loading = false;
          this.productForm.reset();
          this.successMessage = response.success;

          // show the alert for 3.5 seconds before disappearing
          setTimeout(() => {
            this.successMessage = null;
          }, 3500);
        }
    });
    }

  }

  proceedToAdd(): void {
    this.supplierAvailable = true
  }
}
