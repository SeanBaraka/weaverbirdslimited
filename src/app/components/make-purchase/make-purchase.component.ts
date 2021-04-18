import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-make-purchase',
  templateUrl: './make-purchase.component.html',
  styleUrls: ['./make-purchase.component.sass']
})
export class MakePurchaseComponent implements OnInit {
  searchProduct: any; // a form group control for searching for products from the repository
  availableProducts: any[] = []; // an array that stores all the products available in the repository
  purchaseItems: any[] = []; // an array that holds (acts as a cart) items that are being purchased
  changingQuantity = false; // a boolean value that changes when one is editing the quantity of items
  changingPrice = false; // a boolean value that changes when one is editing the price of an item
  purchaseTotal: any; // holds the total value of the items being purchased
  // the purchase form responsible for holding all the details of the purchase.
  // It will be posted for further processing of the purchase order
  purchaseForm: any;
  supplierAvailable = false;

  constructor() { }

  ngOnInit(): void {
  }

  /** handles the change quantity of an item event.
   * @param id - the index of the item being edited
   * @param value - the new value of the item quantity
   */
  changeQuantity(id, value: any): void {

  }

  /**
   * removes the item from the specified index from the list of purchase items
   * @param index - the index of the item to be removed
   */
  removeItemByIndex(index: any): void {

  }

  /** responsible for changing the price of an individual item from the purchases list items
   * @param id - the index of the item being edited
   * @param value - the new price value of the item being edited
   */
  changePrice(id, value: any): void {

  }

  /**
   * searches for products from the array of products, and filters the whole list
   * to the small subset of products
   */
  productSearch(): void {

  }

  finalizePurchase(): void {

  }
}
