import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Shop} from '../interfaces/shop';

@Injectable({
  providedIn: 'root'
})
export class ShopManagerService {
  /** shop manager service,
   * this one here will do stuff, and more stuff, and more stuff.
   * what stuff you may ask, stuff relating to saving the current state of
   * the application in relation to the selected shop.
   * This will help in the display of menu's, i.e. top navigation menus as well as
   * component specific menus that rely on a particular shop.
   */

  /** its been long, with lots of bugs, but I see us finally getting to the end of something good
   * lets see if this finally works out.. BehaviorSubject*/
  protected activeShop: BehaviorSubject<Shop>;
  protected model: Shop = null;

  constructor() {
    this.model = history.state.shop;
    this.activeShop = new BehaviorSubject<Shop>(this.model);
  }

  /** checks whether we have a saved instance of a shop*/
  getShopSaved(): Observable<Shop> {
    return this.activeShop.asObservable();
  }

  /** save a shop instance for future use. */
  saveShop(shopDetails: Shop): void {
    this.activeShop.next(shopDetails)
  }

  /**
   * resets the shop value */
  clearShopHistory(): void {
    this.activeShop.next(this.model);
  }
}
