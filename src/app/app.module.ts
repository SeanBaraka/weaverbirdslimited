import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { StockManagementComponent } from './components/stock-management/stock-management.component';
import { ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { ProductsComponent } from './components/products/products.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from "@angular/material/dialog";
import { OpenShopComponent } from './components/open-shop/open-shop.component';
import { CloseShopComponent } from './components/close-shop/close-shop.component';
import { ShopsAvailableComponent } from './components/shops-available/shops-available.component';
import { VehicleRoutesComponent } from './components/vehicle-routes/vehicle-routes.component';
import { PersonnelComponent } from './components/personnel/personnel.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { AddDriverStockComponent } from './components/add-driver-stock/add-driver-stock.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthComponent } from './components/auth/auth.component';
import { UserLoggedInComponent } from './components/user-logged-in/user-logged-in.component';
import { SummariesComponent } from './components/summaries/summaries.component';
import { AddStockProductComponent } from './components/add-stock-product/add-stock-product.component';
import { ProductTransferComponent } from './components/product-transfer/product-transfer.component';
import { DataDeleteComponent } from './components/data-delete/data-delete.component';
import { FinanceComponent } from './components/finance/finance.component';
import { StockTakeBarComponent } from './components/stock-take-bar/stock-take-bar.component';
import { ProductsSaleComponent } from './components/products-sale/products-sale.component';
import { ConfirmPaymentComponent } from './components/confirm-payment/confirm-payment.component';
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import { ConfigSettingsComponent } from './components/config-settings/config-settings.component';
import { SuperuserSetupComponent } from './components/superuser-setup/superuser-setup.component';
import { AuthLoginComponent } from './components/auth-login/auth-login.component';
import { SalesSummariesComponent } from './components/sales-summaries/sales-summaries.component';
import { environment } from 'src/environments/environment';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { ShopDashboardComponent } from './components/shop-dashboard/shop-dashboard.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { ShopReportsComponent } from './components/shop-reports/shop-reports.component';
import { ShopStockComponent } from './components/shop-stock/shop-stock.component';
import { ShopExpensesComponent } from './components/shop-expenses/shop-expenses.component';
import { ShopSalesReportComponent } from './components/shop-sales-report/shop-sales-report.component';
import { ShopProductSaleComponent } from './components/shop-product-sale/shop-product-sale.component';
import { ShopProfitReportsComponent } from './components/shop-profit-reports/shop-profit-reports.component';
import { ShopPurchaseReportComponent } from './components/shop-purchase-report/shop-purchase-report.component';
import { ShopInventoryReportComponent } from './components/shop-inventory-report/shop-inventory-report.component';
import { ShopEvaluationReportComponent } from './components/shop-evaluation-report/shop-evaluation-report.component';
import { ShopItemTransferReportComponent } from './components/shop-item-transfer-report/shop-item-transfer-report.component';
import { ShopFinancialReportComponent } from './components/shop-financial-report/shop-financial-report.component';
import { ShopVatReportComponent } from './components/shop-vat-report/shop-vat-report.component';
import { ShopSuppliersReportComponent } from './components/shop-suppliers-report/shop-suppliers-report.component';
import { ShopReportsMenuComponent } from './components/shop-reports-menu/shop-reports-menu.component';
import { MenuDropDownComponent } from './components/menu-drop-down/menu-drop-down.component';
import { ShopSalesReportAllComponent } from './components/shop-sales-report-all/shop-sales-report-all.component';
import { ShopSalesPaymentsReportComponent } from './components/shop-sales-payments-report/shop-sales-payments-report.component';
import { ShopSalesInvoicesReportComponent } from './components/shop-sales-invoices-report/shop-sales-invoices-report.component';
import { SearchPrintFilterComponent } from './components/search-print-filter/search-print-filter.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { BackButtonComponent } from './components/micro-interactions/back-button/back-button.component';
import { CustomersListComponent } from './components/customers-list/customers-list.component';
import { CreateCustomerComponent } from './components/create-customer/create-customer.component';
import { MakePurchaseComponent } from './components/make-purchase/make-purchase.component';
import { PurchasesComponent } from './components/purchases/purchases.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { EmployeeHireComponent } from './components/employee-hire/employee-hire.component';

@NgModule({
  declarations: [
    AppComponent,
    SidemenuComponent,
    StockManagementComponent,
    ProductsComponent,
    OpenShopComponent,
    CloseShopComponent,
    ShopsAvailableComponent,
    VehicleRoutesComponent,
    PersonnelComponent,
    VehiclesComponent,
    AddDriverStockComponent,
    DashboardComponent,
    AuthComponent,
    UserLoggedInComponent,
    SummariesComponent,
    AddStockProductComponent,
    ProductTransferComponent,
    DataDeleteComponent,
    FinanceComponent,
    StockTakeBarComponent,
    ProductsSaleComponent,
    ConfirmPaymentComponent,
    ConfigSettingsComponent,
    SuperuserSetupComponent,
    AuthLoginComponent,
    SalesSummariesComponent,
    DashboardAdminComponent,
    ShopDashboardComponent,
    InvoicesComponent,
    ShopReportsComponent,
    ShopStockComponent,
    ShopExpensesComponent,
    ShopSalesReportComponent,
    ShopProductSaleComponent,
    ShopProfitReportsComponent,
    ShopPurchaseReportComponent,
    ShopInventoryReportComponent,
    ShopEvaluationReportComponent,
    ShopItemTransferReportComponent,
    ShopFinancialReportComponent,
    ShopVatReportComponent,
    ShopSuppliersReportComponent,
    ShopReportsMenuComponent,
    MenuDropDownComponent,
    ShopSalesReportAllComponent,
    ShopSalesPaymentsReportComponent,
    ShopSalesInvoicesReportComponent,
    SearchPrintFilterComponent,
    UserManagementComponent,
    BackButtonComponent,
    CustomersListComponent,
    CreateCustomerComponent,
    MakePurchaseComponent,
    PurchasesComponent,
    EmployeesComponent,
    EmployeeHireComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
