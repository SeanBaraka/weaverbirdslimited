import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockDataService } from 'src/app/services/stock-data.service';
import { VehicleService } from 'src/app/services/vehicle.service';
import { ShopManagerService } from 'src/app/services/shop-manager.service';
import { AuthService } from 'src/app/services/auth.service';
import {CustomerService} from '../../services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { ShopsAvailableComponent } from '../shops-available/shops-available.component';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.sass']
})
export class DashboardAdminComponent implements OnInit {

  items: any[] = []
  shops: any[] = []
  vehicles: any[] = [];

  userIsAdmin: boolean;
  isSuperAdmin: boolean;
  customers: any[] = [];

  departments: any[] = [];
  suppliers: any[] = [];

  constructor(
    private router: Router,
    private shopsService: StockDataService,
    private vehicleService: VehicleService,
    private customerService: CustomerService,
    private shopManageService: ShopManagerService,
    private dialog: MatDialog,
    private authservice: AuthService) { }

  ngOnInit(): void {
    this.getAvailableShops();
    this.getVehicles();
    this.checkAdminStatus();
    this.checkSuperAdmin();
    this.getTopCustomers(3);
    this.getSuppliers();
  }

  /** checks whether the user is an admin user */
  checkAdminStatus(): void {
    const userData = this.authservice.getUserData();
    if (!userData.isa && !userData.issa) {
      this.userIsAdmin = false
    } else {
      this.userIsAdmin = true;
    }
  }

  getSuppliers(): void {
    this.shopsService.getSuppliers().subscribe((response) => {
      this.suppliers = response;
    });
  }

  checkSuperAdmin(): void {
    const userData = this.authservice.getUserData();
    if (userData.issa) {
      this.isSuperAdmin = true;
    }
  }

  /** gets an array of customers and displays them here
   * @param items - the number of customers to show
   */
  getTopCustomers(items: number): void {
    this.customerService.getCustomers().subscribe((customersResponse: any[]) => {
      if (customersResponse.length > 0) {
        customersResponse.forEach((customer) => {
          if (customer.saleRecords == null) {
            customer.saleRecords = [];
          }
        });
        this.customers = customersResponse.splice(0, 2);
      }
    });
  }

  /** responsible for page navigations from the main dashboard */
  navigateToDestination(shop: any): void{
    // attempt to add the selected shop to the database
    // history.pushState(shop, 'shop')
    switch (shop.category.name) {
      case 'Bar':
        console.log(shop)
        this.router.navigate(['dashboard', 'stock'], {
          state: {
            shop: shop,
            simpleShop: true,
            openStatus: shop.openStatus
          }
        });
        this.shopManageService.saveShop(shop)
        break;

      default:
        this.router.navigate(['admin','shop'], {
          state: {
            shop
          }
        })
        this.shopManageService.saveShop(shop);
        break;
    }
  }

  getAvailableShops(): void {
    this.shopsService.getShops().subscribe((response: any[]) => {
      this.shops = response
    })
  }

  getVehicles(): void {
    this.vehicleService.getVehicles().subscribe((response) => {
      this.vehicles = response
    })
  }

  /** navigate to shop settings */
  goToSettings(): void {
    this.dialog.open(ShopsAvailableComponent, {
      width: '720px',
      disableClose: true
    }).afterClosed().subscribe((data) => {

    })
  }
}
