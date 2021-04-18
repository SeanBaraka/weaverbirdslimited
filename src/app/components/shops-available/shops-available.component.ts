import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, Validators} from "@angular/forms";
import {StockDataService} from "../../services/stock-data.service";

@Component({
  selector: 'app-shops-available',
  templateUrl: './shops-available.component.html',
  styleUrls: ['./shops-available.component.sass']
})
export class ShopsAvailableComponent implements OnInit {
  shops: any[] = [];
  departments: any[] = [];
  shopCategories: any[] = [];

  shopForm = this.fb.group({
    name: ['', Validators.required],
    desc: [''],
    shopCategory: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private stockService: StockDataService) { }

  ngOnInit(): void {
    this.shopsList();
    this.getShopCategories();
  }

  shopsList(): void {
    this.stockService.getShops().subscribe((data) => {
      this.shops = data;
    });
  }

  getShopCategories(): void {
    this.stockService.getShopCategories().subscribe((response) => {
      this.shopCategories = response;
    });
  }

  addShop(): void {
    console.info(this.shopForm.value);
    // this.stockService.addShop(this.shopForm.value).subscribe((response) => {
    //   if (response) {
    //     this.shopForm.reset();
    //     this.ngOnInit();
    //   }
    // });
  }
}
