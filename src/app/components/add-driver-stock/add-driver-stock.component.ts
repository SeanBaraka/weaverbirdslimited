import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, Validators} from "@angular/forms";
import {VehicleService} from "../../services/vehicle.service";
import {ProductsManagementService} from "../../services/products-management.service";
import {Product} from "../../interfaces/product";
import {StockDataService} from "../../services/stock-data.service";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmltopdf from 'html-to-pdfmake';
import {MessageNotificationsService} from "../../services/message-notifications.service";
import {environment} from "../../../environments/environment";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-add-driver-stock',
  templateUrl: './add-driver-stock.component.html',
  styleUrls: ['./add-driver-stock.component.sass']
})
export class AddDriverStockComponent implements OnInit {
  // holds the driver and route assigned to a vehicle
  driverRouteStockForm = this.fb.group({
    driver: ['', Validators.required],
    route: ['', Validators.required],
    vehicle: [this.data.plateNumber]
  });
  drivers: any[] = [];
  vroutes: any[] = [];
  stockProducts: Product[] = [];
  availableProducts: any[] = [];

  // form adding stock to the vehicle
  addStockForm = this.fb.group({
    name: ['', Validators.required],
    unitPrice: ['', Validators.required],
    availableUnits: ['', Validators.required]
  });

  // Determines whether its okay to add stock to a vehicle or not.
  // the vehicle first needs to have been assigned a driver and a route
  // for this to be active
  vehicleAssignedDriver = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private vehicleService: VehicleService,
              private prodService: ProductsManagementService,
              private dialog: MatDialogRef<AddDriverStockComponent>,
              private messageNotifications: MessageNotificationsService,
              private stockService: StockDataService) { }

  ngOnInit(): void {
    this.getVehicleRoutes();
    this.getVehicleDrivers();
    this.getProducts();
  }

   getProducts(): void {
    this.prodService.listProducts().subscribe((data: Product[]) => {
      this.availableProducts = data;
    });
  }

  getVehicleDrivers(): void {
    this.vehicleService.getDriversList().subscribe((data) => {
      this.drivers = data;
    });
  }

  getVehicleRoutes(): void {
    this.vehicleService.getVehicleRoutes().subscribe((routes) => {
      this.vroutes = routes;
    });
  }

  // adds a driver to a vehicle,
  addDriverVehicleRoute(): void {
    if (this.driverRouteStockForm.valid) {
      this.vehicleAssignedDriver = true;
    }
  }

  dispatchVehicle(): void {
    const dispatchInfo = {
      vehicle: this.data.plateNumber,
      // driver: this.driverRouteStockForm.get('driver').value,
      // route: this.driverRouteStockForm.get('route').value,
      stock: this.stockProducts
    };
    // first assign the driver to the vehicle officially. as well as
    // the route expected to take
    this.vehicleService.addDriverToVehicle(this.driverRouteStockForm.value).subscribe((rsp) => {
      if (rsp) {
        this.vehicleService.dispatchVehicle(dispatchInfo).subscribe((dispatchResponse) => {
          if (dispatchResponse) {
            const message = {
              recipients: environment.recipients,
              message: `Hello Peter, ${dispatchResponse.success}`
            };
            this.messageNotifications.sendMessage(message).subscribe((response: any) => {
              console.log(response.message);
            });
            // print dispatch report
            this.printReport();
            this.dialog.close(dispatchResponse);
          }
        });
      }
    });
  }

  updateStock(): void {
    this.stockProducts.push(this.addStockForm.value);
    this.addStockForm.reset();
  }


  /** print the dispatch report */
  printReport(): void {
    const documentDefinition = {
      content: [
         {
          text: `${new Date(Date.now()).toLocaleDateString()}`,
          fontSize: 7
        },
        {
          image: 'data:image/png;base64,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',
          width: 100
        },
        {
          text: `Vehicle Dispatch Report - Vehicle (${this.data.plateNumber})`,
          fontSize: 12,
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              { text: `Date - ${new Date(Date.now()).toLocaleDateString()}`, style: 'textRegular'},
              { text: `Vehicle - ${this.data.plateNumber}`, style: 'textRegular'},
              { text: `Driver - ${this.driverRouteStockForm.get('driver').value}`, style: 'textRegular'},
              { text: `Transport Route - ${this.driverRouteStockForm.get('route').value}`, style: 'textRegular'},
              {text: 'Pourtap Limited', style: 'textRegular'},
              {text: 'P.O. Box 456-90100', style: 'textRegular'},
              {
                text: 'Nairobi',
                fontSize: 8,
                style: {
                  margin: [0, 10, 0, 20]
                }
              }
            ],
          ]
        },
        {
          text: 'Products Stock Details',
          bold: true,
          style: 'subHeading'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            heights: (row) => {
              if (row === 0) {
                return 0;
              } else {
                return 17;
              }
            },
            body: [
              ['Product Name', 'Unit Price', 'Quantity', 'Sub Total'],
              ...this.stockProducts.map((p => (
                [
                  p.name, p.unitPrice, p.availableUnits,
                  (p.unitPrice * p.availableUnits).toFixed(2)
                ]))),
              [
                {
                  text: 'Total', fontSize: 8, bold: true, colspan: 3
                }, {}, {},
                this.getStockTotalAmount().toFixed(2)
                ]
            ]
          },
          layout: 'headerLineOnly',
          fontSize: 8
        },
        {
          text: '',
          margin: [0, 15, 0, 15]
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto'],
            body: [
              ['Stock Carried:', this.getStockTotal()],
              ['Stock Carried Total:', `KSH. ${this.getStockTotalAmount().toLocaleString()}`]
            ]
          },
          layout: 'noBorders',
          fontSize: 10,
          bold: true
        },
        {
          columns: [
            [
              {text: '', margin: [0, 10, 0, 10]},
              {text: 'Confirmed and signed by:\n\nName ...................................................', style: 'textRegular'},
              {text: 'Signature ..............................................', style: 'textRegular'}
            ],
            [
              {text: '', margin: [0, 10, 0, 10]},
              {
                text: 'scan the QR to validate vehicle dispatch records',
                style: 'textRegular'
              },
              {
                qr: `vehicle ${this.data.plateNumber} carrying ${this.getStockTotalAmount()} as at ${new Date(Date.now()).toLocaleDateString()}`,
                fit: '50',
                alignment: 'center'
              }
            ]
          ]
        }
      ],
      styles: {
        sectionHeader: {
          margin: [0, 10, 0, 10],
          decoration: 'underline',
          bold: true
        },
        subHeading: {
          margin: [0, 20, 0, 10],
          fontSize: 10
        },
        textRegular: {
          margin: [0, 5, 0, 5],
          fontSize: 8
        }
      }
    };
    pdfMake.createPdf(documentDefinition).print();
  }

  private getStockTotalAmount(): number {
    const totalAmount = [];
    this.stockProducts.forEach((item) => {
      totalAmount.push(item.availableUnits * item.unitPrice);
    });

    return totalAmount.reduce((a, b) => a + b , 0);
  }

  private getStockTotal(): number {
    const totalStock = [];
    this.stockProducts.forEach((item) => {
      totalStock.push(item.availableUnits);
    });

    return totalStock.reduce((a, b) => a + b , 0);
  }
}
