import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockManagementComponent } from './components/stock-management/stock-management.component';
import {ProductsComponent} from "./components/products/products.component";
import {ShopsAvailableComponent} from "./components/shops-available/shops-available.component";
import {VehiclesComponent} from "./components/vehicles/vehicles.component";
import {PersonnelComponent} from "./components/personnel/personnel.component";
import {VehicleRoutesComponent} from "./components/vehicle-routes/vehicle-routes.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {AuthGuard} from "./services/auth.guard";
import {AuthComponent} from "./components/auth/auth.component";
import {SummariesComponent} from "./components/summaries/summaries.component";
import {FinanceComponent} from "./components/finance/finance.component";
import {StockTakeBarComponent} from "./components/stock-take-bar/stock-take-bar.component";
import { ConfigSettingsComponent } from './components/config-settings/config-settings.component';
import { SuperuserSetupComponent } from './components/superuser-setup/superuser-setup.component';
import { AuthLoginComponent } from './components/auth-login/auth-login.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { ShopDashboardComponent } from './components/shop-dashboard/shop-dashboard.component';
import { ShopStockComponent } from './components/shop-stock/shop-stock.component';
import { ShopReportsComponent } from './components/shop-reports/shop-reports.component';
import { ShopSalesReportComponent } from './components/shop-sales-report/shop-sales-report.component';
import { ShopPurchaseReportComponent } from './components/shop-purchase-report/shop-purchase-report.component';
import { ShopSuppliersReportComponent } from './components/shop-suppliers-report/shop-suppliers-report.component';
import { ShopInventoryReportComponent } from './components/shop-inventory-report/shop-inventory-report.component';
import { ShopEvaluationReportComponent } from './components/shop-evaluation-report/shop-evaluation-report.component';
import { ShopVatReportComponent } from './components/shop-vat-report/shop-vat-report.component';
import { ShopItemTransferReportComponent } from './components/shop-item-transfer-report/shop-item-transfer-report.component';
import { ShopFinancialReportComponent } from './components/shop-financial-report/shop-financial-report.component';
import { ShopProductSaleComponent } from './components/shop-product-sale/shop-product-sale.component';
import { ShopSalesReportAllComponent } from './components/shop-sales-report-all/shop-sales-report-all.component';
import { ShopSalesPaymentsReportComponent } from './components/shop-sales-payments-report/shop-sales-payments-report.component';
import { ShopSalesInvoicesReportComponent } from './components/shop-sales-invoices-report/shop-sales-invoices-report.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import {CustomersListComponent} from './components/customers-list/customers-list.component';
import { PurchasesComponent} from './components/purchases/purchases.component';
import {SuppliersComponent} from './components/suppliers/suppliers.component';

const routes: Routes = [
  { path: 'auth', component: AuthComponent, children: [
    { path: 'register', component: SuperuserSetupComponent },
    { path: 'login', component: AuthLoginComponent }
  ] },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], children: [
      { path: 'products', component: ProductsComponent },
      { path: '', redirectTo: 'summaries', pathMatch: 'full'},
      { path: 'summaries', component: SummariesComponent },
      { path: 'stock', component: ShopStockComponent },
      { path: 'stock-bar', component: StockTakeBarComponent },
      { path: 'shops', component: ShopsAvailableComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'customers', component: CustomersListComponent},
      { path: 'routes', component: VehicleRoutesComponent },
      { path: 'personnel', component: PersonnelComponent },
      { path: 'finance', component: FinanceComponent },
      { path: 'suppliers', component: SuppliersComponent},
      { path: 'settings', component: ConfigSettingsComponent },
      { path: 'user-management', component: UserManagementComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'reports', component: ShopReportsComponent, children: [
        { path: '', redirectTo: 'sales', pathMatch: 'full'},
        { path: 'sales', component: ShopSalesReportComponent , children: [
          { path: '', redirectTo: 'all', pathMatch: 'full'},
          {path: 'all', component: ShopSalesReportAllComponent },
          { path: 'products', component: ShopProductSaleComponent },
          { path: 'payments', component: ShopSalesPaymentsReportComponent},
          { path: 'invoices', component: ShopSalesInvoicesReportComponent },
            {path: 'finance', component: FinanceComponent}

        ]},
        { path: 'purchases', component: ShopPurchaseReportComponent},
        { path: 'suppliers', component: ShopSuppliersReportComponent},
        { path: 'inventory', component: ShopInventoryReportComponent},
        { path: 'evaluation', component: ShopEvaluationReportComponent },
        { path: 'tax', component: ShopVatReportComponent },
        { path: 'product-transfer', component: ShopItemTransferReportComponent },
        { path: 'finance', component: ShopFinancialReportComponent }
      ] }
    ]
  },

  { path: 'admin', component: DashboardAdminComponent, canActivate: [AuthGuard]},
  { path: 'admin/shop', component: ShopDashboardComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
