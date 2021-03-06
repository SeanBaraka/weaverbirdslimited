import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmPaymentComponent} from "../confirm-payment/confirm-payment.component";
import * as pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {ProductSaleService} from "../../services/product-sale.service";
import { RealTimeDataService } from 'src/app/services/real-time-data.service';
import {CustomerService} from '../../services/customer.service';
import { AuthService } from 'src/app/services/auth.service';
import { RestockDialogComponent } from '../restock-dialog/restock-dialog.component';
import { StockDataService } from 'src/app/services/stock-data.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-products-sale',
  templateUrl: './products-sale.component.html',
  styleUrls: ['./products-sale.component.sass']
})
export class ProductsSaleComponent implements OnInit {
  /** a global variable for the amount received */
  globalSaleAmount: number = 0;

  searchProduct = this.fb.group({
    serialNumber: ['', Validators.required]
  });
  completeSale = this.fb.group({
    amount: ['', Validators.required]
  });

  customers: any[] = [];

  paymentMethod = {
    cash: false,
    mobile: false,
    invoice: false,
    quotation: false,
    cheque: false,
    bank: false,
    split: false
  };

  private receiptNumber: string;
  checkingStatus: boolean;
  user: any;
  stockProducts: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private thisDialog: MatDialogRef<ProductsSaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private saleService: ProductSaleService,
    private realTimeService: RealTimeDataService,
    private customerService: CustomerService,
    private stockData: StockDataService,
    private authService: AuthService
    ) { 
      this.user = authService.getUserData()
    }

  cartProducts: any[] = [];
  cartTotal = 0;
  cashBalance = 0;
  taxTotal = 0;

  cashForm = this.fb.group({
    cashReceived: ['', Validators.required]
  });

  mpesaForm = this.fb.group({
    cashReceived: ['', Validators.required],
    transactionId: ['', Validators.required]
  })

  splitOptions = this.fb.group({
    cash: ['', Validators.required],
    mpesa: ['', Validators.required]
  })

  invoiceForm = this.fb.group({
    number: [''],
    customerName: ['', Validators.required],
    customerTel: ['', Validators.required]
  });

  bankForm = this.fb.group({
    bankName: ['Cooperative Bank'],
    bankAmount: ['', Validators.required]
  })
  

  ngOnInit(): void {
    this.getShopProducts();
    this.paymentMethod.cash = true;
    this.paymentMethod.mobile = false;
    this.retrieveCustomers();

    // this here is for a special occassion, i.e. when the invoice is requested earlier.
    // e.g. when a user clicks on invoices from the main menu.
    if (this.data.invoice != undefined || this.data.invoice != null ) {
      this.paymentMethod.cash = false;
      this.paymentMethod.mobile = false;
      this.paymentMethod.invoice = true
    }
  }

  retrieveCustomers(): void {
    this.customerService.getCustomers().subscribe((response) => {
      this.customers = response;
    });
  }

  getShopProducts(): void {
    this.stockData.getShopStock(this.data.shopId).subscribe((products) => {
      if (products) {
        this.stockProducts = products;
      }
    });
  }

  productSearch(): void {
    const stockedProducts = this.stockProducts;
    const searchParam = this.searchProduct.get('serialNumber').value;
    let product = stockedProducts.filter(x => x.serialNumber === searchParam).pop();

    if (product == null) {
      product = stockedProducts.filter(x => x.name.toLowerCase() === searchParam.toLowerCase()).pop();
      if (product.quantity <= 0) {
          this.dialog.open(RestockDialogComponent, {
            width: '400px'
          }).afterClosed().subscribe(result => {
            this.searchProduct.reset()
          })
      } else {
        // if the product exists in the cart, increment the quantity, else add the new item
        // into the cart for checkout
        if (this.cartProducts.find((x) => x.serialNumber === product.serialNumber)) {
          const existingItem = this.cartProducts.find((x) => x.serialNumber === product.serialNumber);
          existingItem.quantity ++;
        } else {
          product.availableBalance = product.quantity
          product.quantity = 1;
          this.cartProducts = [...this.cartProducts, product];
        }
        this.cartTotal = this.computeCartTotal(this.cartProducts);
        this.taxTotal = this.cartTotal * 0.16
        this.searchProduct.reset();
      }
    }

  }

  /** one should be able to remove an item or a list of items from the cart
   * the following two methods do exactly that.
   * clearing the cart, nothing more
   */
  // 1. remove a single item from the cart
  removeItemByIndex(item: any): void {
    // we use the splice method to remove a single item from the array
    // we, (and by we I mean I.. I am doing this alone, should start thinking of creating a team) do this by finding the index of the element using the .indexOf() function provided by the array [] type of stuff..
    const index = this.cartProducts.indexOf(item);
    // use the index to splice the array, splice is used to remove an element from an array.
    this.cartProducts.splice(index, 1);

    // once done recalculate the total cart total.. and we done removing a single item
    this.cartTotal = this.computeCartTotal(this.cartProducts)
    this.taxTotal = this.cartTotal * 0.16
  }

  changingQuantity = true
  changingPrice = true


  toggleInput(): void {
    this.changingQuantity = true
  }

  /**this is a bit tricky.
   * @param index the index of the cart item to alter
   * @param value the value of the input trigerring this function
   */
  changeQuantity(index: number, value: string): void {
    const cartItem = this.cartProducts.find(x => x.id == index )
    cartItem.quantity = value;
    this.cartTotal = this.computeCartTotal(this.cartProducts)
    this.taxTotal = this.cartTotal * 0.16
  }

  changePrice(index: number, value: string): void {
    const cartItem = this.cartProducts.find(x => x.id == index )
    
    this.paymentMethod.invoice ? cartItem.minPrice = value : cartItem.sellingPrice = value;
    this.cartTotal = this.computeCartTotal(this.cartProducts)
    this.taxTotal = this.cartTotal * 0.16
  }

  getBalance(): number {
    let cash;
    cash = this.cashForm.get('cashReceived').value;
    if (cash === null) {
      cash = this.mpesaForm.get('cashReceived').value;
    }
    //TODO: if the shop is of the specified criteria, Exclude VAT
    //return cash - (this.cartTotal + this.taxTotal);
    return cash - this.cartTotal;
  }

  computeCartTotal(cartItems: any[]): number {
    if (cartItems != null && cartItems.length > 0) {
      let subTotals = [];
      cartItems.forEach(e => {
        const itemTotal = this.data.invoice ? e.quantity * e.minPrice : e.quantity * e.sellingPrice;
        subTotals = [...subTotals, itemTotal];
      });
      return subTotals.reduce((a, b) => a + b, 0);
    } else {
      return 0;
    }
  }

  finalizeSale(amount?: number, transactionCode?: string): void {
    const receiptNumber = (Math.random() * 10000).toFixed(0);
    let paymentMethod;
    let customer;
    let transactionId;
    // check the payment method options
    switch (this.paymentMethod.cash) {
      case true: {
        paymentMethod = 'CASH';
        // transactionAmount = this.cashForm.get('cashReceived').value
        break;
      }
    }

    switch (this.paymentMethod.split) {
      case true: {
        paymentMethod = 'SPLIT';
        // transactionAmount = this.cashForm.get('cashReceived').value
        break;
      }
    }

    switch (this.paymentMethod.mobile) {
      case true: {
        paymentMethod = 'MOBILE';
        transactionId = transactionCode ? transactionCode : "PAKD234KLk";
        customer = 'customer';
        break;
      }
    }

    switch (this.paymentMethod.bank) {
      case true: {
        paymentMethod = 'BANK';
      }
    }

    switch (this.paymentMethod.invoice) {
      case true: {
        paymentMethod = 'INVOICE';
        customer = this.invoiceForm.value;
        break;
      }
    }

    const cart = this.cartProducts;
    const sellAmount = this.cartTotal;
    let amountTendered = 0;
    if (this.paymentMethod.cash) {
      amountTendered = this.cashForm.get('cashReceived').value
    } else if (this.paymentMethod.bank) {
      amountTendered = this.bankForm.get('bankAmount').value
    }
    const balanceToReturn = amountTendered - sellAmount;
    let amountReceived = amount ? amount : 0;

    if (balanceToReturn >= 0) {
      amountReceived = sellAmount;
    }

     // handle split payments
     let splitOptions = {}
     if (this.paymentMethod.split) {
       splitOptions = this.splitOptions.value
     }


    const sellOrder = {
      items: cart,
      totalAmount: sellAmount,
      amountReceived,
      receiptNumber,
      paymentMethod,
      transactionId,
      customer
    };
    const shopId = this.data.shopId;
    this.saleService.makeSale(shopId, sellOrder).subscribe((response) => {
      if (response) {
        this.receiptNumber = response.receiptNumber;
        this.printReceipt(sellOrder.amountReceived);
        this.getShopProducts()
      }
    });
  }

  generateQuote(): void {
    this.printReceipt()
  }

  confirmMobilePayment(): void {
    this.checkingStatus = true;
    const amount = this.mpesaForm.get('cashReceived').value;
    const transactionCode = this.mpesaForm.get('transactionId').value
           
    // this.finalizeSale(amount, transactionCode);
    this.realTimeService.getTransactionDetails((success) => {
      this.checkingStatus = false; // FIXME: was false
      if (success) {
        this.dialog.open(ConfirmPaymentComponent, {
          width: '400px',
          data: success,
          disableClose: true,
        }).afterClosed().subscribe((closeData: any) => {
          if (closeData.status == 'confirmed') {
            this.paymentMethod.mobile = true;
            const transactionCode = closeData.transactionId;
            const amount = closeData.amount;
            this.globalSaleAmount = amount;
            this.finalizeSale(amount, transactionCode);
            this.thisDialog.close();
          }
        });
      }
    });
  }

  mobilePayment(): void {
    this.paymentMethod.mobile = true;
    this.checkingStatus = false; // FIXME: initially false .. ????
    this.paymentMethod.cash = !this.paymentMethod.mobile
    this.paymentMethod.bank = !this.paymentMethod.mobile
    this.paymentMethod.invoice = !this.paymentMethod.mobile
    this.paymentMethod.quotation = !this.paymentMethod.mobile
    this.paymentMethod.split = !this.paymentMethod.mobile
  }

  splitPayment(): void {
    this.paymentMethod.split = true;
    this.paymentMethod.cash = !this.paymentMethod.split
    this.paymentMethod.bank = !this.paymentMethod.split
    this.paymentMethod.invoice = !this.paymentMethod.split
    this.paymentMethod.quotation = !this.paymentMethod.split
    this.paymentMethod.mobile = !this.paymentMethod.split
  }

  cashPayment(): void {
    this.paymentMethod.cash = true;
    this.paymentMethod.split = !this.paymentMethod.cash
    this.paymentMethod.bank = !this.paymentMethod.cash
    this.paymentMethod.invoice = !this.paymentMethod.cash
    this.paymentMethod.quotation = !this.paymentMethod.cash
    this.paymentMethod.mobile = !this.paymentMethod.cash
  }

  bankPayment(): void {
    this.paymentMethod.bank = true
    this.paymentMethod.split = !this.paymentMethod.bank
    this.paymentMethod.cash = !this.paymentMethod.bank
    this.paymentMethod.invoice = !this.paymentMethod.bank
    this.paymentMethod.quotation = !this.paymentMethod.bank
    this.paymentMethod.mobile = !this.paymentMethod.bank
    
  }

  receivePayment(): void {
    this.cashBalance = this.getBalance();
  }

  printReceipt(amount?: any): void {
    const documentDefinition = {
      pageSize: { width: 700, height: 1000},
      pageMargins: 25,
      content: [
       this.data.shopId === 2 ? {
          image: 'data:image/png;base64,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',
          width: this.paymentMethod.invoice ? 100 : 400,
          alignment: this.paymentMethod.invoice ? 'left' : 'center'
        } : {},
        this.paymentMethod.invoice ? {
          columns: [
            [
              { text: `Date - ${new Date(Date.now()).toLocaleDateString()}`, width: '*', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {
                text: this.paymentMethod.invoice ? `INVOICE NO:  #${this.receiptNumber}` : `Receipt Number #${this.receiptNumber}`,
                style: 'textRegular',
                alignment: this.paymentMethod.invoice ? 'left' : 'center'
              },
              {text: 'Weaverbirds Limited', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: `${this.data.shopName}`, style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'P.O. Box 3305-90100 NAIROBI KENYA', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'}
            ],
            // this is the part of the header that shows customer details
            // it is only available for the invoice payment method
            [
              { text: `BILLING INFORMATION:`, style: 'textRegular', alignment: 'right', bold: true},
              {
                text: `Invoice Status: NOT PAID`,
                style: 'textRegular',
                alignment: 'right'
              },
              {text: `CUSTOMER:  ${this.invoiceForm.get('customerName').value.toUpperCase()}`, style: 'textRegular', alignment: 'right'},
              {text: `TEL NO: ${this.invoiceForm.get('customerTel').value}`, style: 'textRegular', alignment: 'right'}
            ]
          ]
        } : {
          columns: [
            this.data.shopId === 2 ? [
              {text: 'Weaverbirds Limited', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'P.O. BOX 3305 - 90100 Machakos, Kenya', style: 'textRegular', alignment: 'center'},
              {text: `${this.data.shopName}`, style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'TEL: 0727275739. Email: info@weaverbirdsupplies.co.ke', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              // {text: 'PIN: P051815907L', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'}
            ] : {}
          ]
        },
        this.paymentMethod.invoice !== true ? {
          columns: [
            this.data.shopId === 2 ?[
              {text: `CASH SALE`, style: 'subHeading', bold: true , alignment: 'center', decoration: 'underline'},
              {text: `Receipt Number: #${this.receiptNumber}`, style: 'textRegular', bold: true, alignment: 'center'},
              {text: `Paybill Number: 4067985 | Acc. Weaverbirds`, style: 'textRegular', bold: true, alignment: 'center'},
              {text: 'PIN Number. P051815907L', style: 'subHeading', alignment: 'center' },
              {text: `Date Time: ${new Date(Date.now()).toLocaleDateString()} ${new Date(Date.now()).toLocaleTimeString()}`, style: 'textRegular', alignment: 'center'}
            ] : [
              {text: `CASH SALE`, style: 'subHeading', bold: true , alignment: 'center', decoration: 'underline'},
              {text: `Date Time: ${new Date(Date.now()).toLocaleDateString()}`, style: 'textRegular', alignment: 'center'},
              {text: `Receipt Number: ${this.receiptNumber}`, style: 'textRegular', alignment: 'center'}
            ]
          ]
        } : {

        },
        {
          text: this.paymentMethod.invoice ? 'INVOICE SALE' : '',
          bold: true,
          style: 'subHeading',
          alignment: this.paymentMethod.invoice ? 'left' : 'center'
        },
        {
          layout: 'headerLineOnly',
          table: {
            headerRows: 1,
            widths: [ this.paymentMethod.invoice ? '*' : 400, 'auto', 'auto', 'auto'],
            heights: (row) => {
              if (row === 0) {
                return 0;
              } else {
                return 17;
              }
            },
            body: [
              [{text:this.paymentMethod.invoice ? 'Product Name' : 'ITEM', style: 'tableHeader'}, {text: 'QTY', style: 'tableHeader'}, {text: 'PRICE', style: 'tableHeader'}, {text: 'PRICE', style: 'tableHeader'}],
              ...this.cartProducts.map((p => (
                [
                  {text: p.name, style: 'textRegular', margin: this.paymentMethod.invoice ? [0,5,0,5] : [0, 10, 0, 10]},
                  {text: p.quantity, style: 'textRegular', margin: this.paymentMethod.invoice ? [0,5,0,5] : [0, 10, 0, 10]},
                  {text: this.paymentMethod.invoice ? p.minPrice : p.sellingPrice, style: 'textRegular', margin: this.paymentMethod.invoice ? [0,5,0,5] : [0, 10, 0, 10]},
                  {text: this.paymentMethod.invoice ? (p.quantity * p.minPrice).toFixed(2) : (p.quantity * p.sellingPrice).toFixed(2), style: 'textRegular', margin: this.paymentMethod.invoice ? [0,5,0,5] : [0, 10, 0, 10]}
                ]))),
            ]
          },
          // layout: 'headerLineOnly',
          fontSize: this.paymentMethod.invoice ? 8 : 24
        },
        this.paymentMethod.invoice ? {
          text: '',
          margin: 0
        } : {
          text: '',
          margin: [0, 35, 0, 35]
        },
        {
          columns: [
              [
                {
                  text: 'Sub Total: ', style: 'textRegularLarge', bold: true, colspan: 6, margin: this.paymentMethod.invoice ? 0 : [0 , 35, 0, 35]
                }
              ],
              [
                {
                  text: `${this.computeCartTotal(this.cartProducts).toFixed(2)}`,
                  style: 'textRegularLarge',
                  bold: true,
                  alignment: 'right',
                  margin: this.paymentMethod.invoice ? [0, 0, 5, 0] : [0, 35, 0, 35]
                }
              ]
          ],
        },
        {
          columns: [
              [
                {
                  text: 'TOTAL: ', style: 'textRegularLarge', bold: true, colspan: 6, margin: this.paymentMethod.invoice ? 0 : [0 , 35, 0, 35]
                }
              ],
              [
                {
                  text: `${this.cartTotal.toFixed(2)}`,
                  style: 'textRegularLarge',
                  bold: true,
                  alignment: 'right',
                  margin: this.paymentMethod.invoice ? [0, 0, 5, 0] : [0, 35, 0, 35]
                }
              ]
          ],
        },
        {
          columns: [
            {
              text: this.paymentMethod.invoice ? '' : 'CASH PAID: ',
              style: 'textRegularLarge',
              margin: [0, 0, 0, 35],
              bold: true,
              colspan: 6
            }, {}, {
              text:  this.paymentMethod.invoice ? '' : `${amount.toFixed(2)}`,
              style: 'textRegularLarge',
              bold: true
            }
          ]
        },
        this.paymentMethod.invoice ? {} : {
          columns: [
            {
              text: 'CHANGE: ', style: 'textRegularLarge', bold: true, colspan: 6
            }, {}, {text: `${this.getBalance().toFixed(2)}`, style: 'textRegularLarge', bold: true}
          ]
        },
        this.paymentMethod.invoice != true ? [
          {canvas: [ { type: 'line', x1: 0, y1: 0, x2: 600, y2: 0, lineWidth: 1 } ]},
          {
          text: 'THANK YOU FOR CHOOSING US TO SERVE YOU\nWE APPRECIATE AND VALUE YOUR FEEDBACK\nENJOY OUR PRODUCTS AND WELCOME AGAIN',
          bold: true,
          style: 'textRegularLarge',
          margin: [0, 35, 0, 35]
        }] : {},
        this.paymentMethod.invoice != true ? {
            qr: `date today ${new Date(Date.now()).toLocaleDateString()} were`,
            fit: '20',
            alignment: 'center'
        }: {},
        this.paymentMethod.invoice != true ? {
          text: 'Fiscal Signature',
          alignment: 'center',
          fontSize: 20
        } : {},
        this.paymentMethod.invoice != true ? {
          text: `${btoa((Math.random() * 1200).toString()).toUpperCase()}${btoa((Math.random() * 1000).toString()).toUpperCase()}`,
          alignment: 'center',
          fontSize: 22,
          fontWeight: 'bold'
      }: {},
        this.paymentMethod.invoice ?
        {
          columns: [
            [
              {text: '', margin: [0, 10, 0, 10]},
              {text: 'Confirmed and signed by:\n\nName ...................................................', style: 'textRegular'},
              {text: 'Signature ..............................................', style: 'textRegular'}
            ]
          ]
        }
        : {}
      ],
      styles: {
        sectionHeader: {
          margin: [0, 10, 0, 10],
          decoration: 'underline',
          bold: true
        },
        subHeading: {
          margin: [0, 20, 0, 10],
          fontSize: this.paymentMethod.invoice ? 12 : 26
        },
        textRegular: {
          margin: [0, 5, 0, 5],
          fontSize: this.paymentMethod.invoice ? 10 : 24
        },
        textRegularLarge: {
          margin: [0, 5, 0, 5],
          fontSize: this.paymentMethod.invoice ? 10 : 26
        },
        tableHeader: {
          bold: true,
          margin: [0, 5, 0, 5]
        }
      }
    };
    const win = window.open('', 'winTempForPdf');
    pdfMake.createPdf(documentDefinition).print({ silent: true }, win);
    // win.close(); // print the table data
  }

  invoicePayment(): void {
    this.paymentMethod.invoice = true;
    this.paymentMethod.cash = false;
    this.paymentMethod.mobile = false;
  }

  updateTel(name: string): void {
    const cus = this.customers.find((c) => c.name === name);
    if (cus != null) {
      this.invoiceForm.get('customerTel').setValue(cus.telephone);
    }
  }
}
