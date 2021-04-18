import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {ProductsManagementService} from "../../services/products-management.service";
import {Product} from "../../interfaces/product";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.sass']
})
export class ProductsComponent implements OnInit {

  constructor(private fb: FormBuilder, private prodService: ProductsManagementService) { }

  productForm = this.fb.group({
    name: ['', Validators.required],
    unitPrice: ['', Validators.required],
    qty: ['', Validators.required]
  });

  products: Array<Product> = [];

  ngOnInit(): void {
    this.getProducts();
  }

  /** add a product to the data repository */
  addProduct(): void {
    this.prodService.insertProduct(this.productForm.value).subscribe((data: any) => {
      if (data) {
        // if a success response is found, then get a list of all products
        this.getProducts();
        this.productForm.reset();
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  /** retrieve all products available in the data repository */
  getProducts(): void {
    this.prodService.listProducts().subscribe((data: any[]) => {
      this.products = data;
    });
  }

  getStockTotal(): number {
    const totalStock = [];
    this.products.forEach((item) => {
      totalStock.push(item.availableUnits);
    });

    return totalStock.reduce((a, b) => a + b , 0);
  }

  getStockTotalAmount(): number {

    const totalAmount = [];
    this.products.forEach((item) => {
      totalAmount.push(item.availableUnits * item.unitPrice);
    });

    return totalAmount.reduce((a, b) => a + b , 0);
  }
}
