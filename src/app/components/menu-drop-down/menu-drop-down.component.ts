import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductsSaleComponent } from '../products-sale/products-sale.component';

@Component({
  selector: 'app-menu-drop-down',
  templateUrl: './menu-drop-down.component.html',
  styleUrls: ['./menu-drop-down.component.sass']
})
export class MenuDropDownComponent implements OnInit {

  constructor(private dialog: MatDialog, private router: Router) { }

  menuShown = false

  shop: any;

  items = [
    {title:'POS', image: 'credit-card-machine.svg'},
    {title: 'Invoices', image: 'invoice.svg'}, 
    {title: 'Purchases', image: 'supply.svg'}, 
    {title: 'Quotations', image: 'payment.svg'}, 
    {title:'Stock', image: 'stock-image.svg'}, 
    {title:'Reports', image: 'report.svg'}, 
    {title: 'Cash Summary', image: 'money.png'},
    {title:'Expenses & Gifts', image: 'market.svg'}
  ]

  ngOnInit(): void {
    this.shop = history.state.shop    
  }

  /** handles all the navigation login
   * @param route the route to be navigated into
   */
  navigateToDestination(route: any): void {
    switch (route.title) {
      case 'POS':
        this.router.navigate(['admin', 'shop'], {
          state: {
            shop: this.shop
          }
        })
        this.menuShown = false
        break;

      // Opens the POS dialog box, while open, the window should 
      // be focused on the invoice section of the sale.
      case 'Invoices':
        this.router.navigate(['dashboard', 'invoices'], {
          state : {
            shop: this.shop
          }
        })
        this.menuShown = false
        break;

      case 'Stock':
        this.router.navigate(['dashboard','stock'], {
          state: {
            shop: this.shop,
            simpleShop: true,
            openStatus: this.shop.openStatus
          }
        })
        this.menuShown = false
        break;

      case 'Reports': 
        this.router.navigate(['dashboard', 'reports'], {
          state: {
            shop: this.shop
          }
        })
        this.menuShown = false
        break;
    
      case 'Cash Summary':
        this.router.navigate(['dashboard', 'finance'], {
          state: {
            shop: this.shop
          }
        })
        this.menuShown = false
        break;
        
      default:
        this.menuShown = false
        break;
    }
  }

  /** responsible for the opening and closing the menu */
  toggleMenu(): void {
    if (!this.menuShown) {
      this.menuShown = true
    } else {
      this.menuShown = false
    }
  }
}
