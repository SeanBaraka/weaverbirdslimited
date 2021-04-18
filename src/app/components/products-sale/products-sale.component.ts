import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmPaymentComponent} from "../confirm-payment/confirm-payment.component";
import * as pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {ProductSaleService} from "../../services/product-sale.service";
import { RealTimeDataService } from 'src/app/services/real-time-data.service';
import {CustomerService} from '../../services/customer.service';
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
    invoice: false
  };

  private receiptNumber: string;
  checkingStatus: boolean;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private thisDialog: MatDialogRef<ProductsSaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private saleService: ProductSaleService,
    private realTimeService: RealTimeDataService,
    private customerService: CustomerService
    ) { }

  cartProducts: any[] = [];
  cartTotal = 0;
  cashBalance = 0;
  taxTotal = 0;

  cashForm = this.fb.group({
    cashReceived: ['', Validators.required]
  });

  invoiceForm = this.fb.group({
    number: [''],
    customerName: ['', Validators.required],
    customerTel: ['', Validators.required]
  });

  ngOnInit(): void {
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

  productSearch(): void {
    const stockedProducts = this.data.stockProducts;
    const searchParam = this.searchProduct.get('serialNumber').value;
    let product = stockedProducts.filter(x => x.serialNumber === searchParam).pop();

    if (product == null) {
      product = stockedProducts.filter(x => x.name.toLowerCase() === searchParam.toLowerCase()).pop();
    }

    // if the product exists in the cart, increment the quantity, else add the new item
    // into the cart for checkout
    if (this.cartProducts.find((x) => x.serialNumber === product.serialNumber)) {
      const existingItem = this.cartProducts.find((x) => x.serialNumber === product.serialNumber);
      existingItem.quantity ++;
    } else {
      product.quantity = 1;
      this.cartProducts = [...this.cartProducts, product];
    }
    this.cartTotal = this.computeCartTotal(this.cartProducts);
    this.taxTotal = this.cartTotal * 0.16
    this.searchProduct.reset();
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
    cartItem.sellingPrice = value;
    this.cartTotal = this.computeCartTotal(this.cartProducts)
    this.taxTotal = this.cartTotal * 0.16
  }

  getBalance(): number {
    const cash = this.cashForm.get('cashReceived').value;
    //TODO: if the shop is of the specified criteria, Exclude VAT
    //return cash - (this.cartTotal + this.taxTotal);
    return cash - this.cartTotal;
  }

  computeCartTotal(cartItems: any[]): number {
    if (cartItems != null && cartItems.length > 0) {
      let subTotals = [];
      cartItems.forEach(e => {
        const itemTotal = e.quantity * e.sellingPrice;
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

    switch (this.paymentMethod.mobile) {
      case true: {
        paymentMethod = 'MOBILE';
        transactionId = transactionCode ? transactionCode : "PAKD234KLk";
        customer = 'customer';
        break;
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
    const amountTendered = this.cashForm.get('cashReceived').value;
    const balanceToReturn = amountTendered - sellAmount;
    let amountReceived = amount ? amount : 0;

    if (balanceToReturn >= 0) {
      amountReceived = sellAmount;
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
        this.printReceipt(this.paymentMethod.cash ? this.cashForm.get('cashReceived').value : amount);
      }
    });
  }

  confirmMobilePayment(): void {
    this.checkingStatus = true;
    this.realTimeService.getTransactionDetails((success) => {
      this.checkingStatus = false;
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
        })
      }
    })
  }

  mobilePayment(): void {
    this.paymentMethod.mobile = true;
    this.checkingStatus = false;
    this.paymentMethod.cash = !this.paymentMethod.mobile;
    this.paymentMethod.invoice = !this.paymentMethod.mobile;
  }

  cashPayment(): void {
    this.paymentMethod.cash = true;
    this.paymentMethod.mobile = !this.paymentMethod.cash;
    this.paymentMethod.invoice = !this.paymentMethod.cash;
  }

  receivePayment(): void {
    this.cashBalance = this.getBalance();
  }

  printReceipt(amount?: any): void {
    const documentDefinition = {
      pageSize: { width: 700, height: 1000},
      pageMargins: 25,
      content: [
        {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAb4AAACICAYAAACY2Y7tAAAACXBIWX\n' +
            'MAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAEuySURBVHgB7Z0HgB\n' +
            'T12f+/M7N9ry3HHe2AoyOggGAvHPYWBY0tJgopxn9ior55NXlTXs+0N5pELImJJgYskSAqil1UTh\n' +
            'GRIr1LWe6AA47r23dn5v88v9k9ToS7vcod/D5mssdO352d7zzl9zyARCKRSCQSiUQikUgkEolEIp\n' +
            'FIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikU\n' +
            'gkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSC\n' +
            'QSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJB\n' +
            'KJRCKRSDoDpSULmzNzckKeWJEGZZKpIAedgGKiRjfMWqhYrRrGavfNET8kkvQoSk4DcXxQQ9Mamk\n' +
            'po8kMikbSKtIUvPNtVCFVdSKsU4tjip6Muga4/IEVQchT4oWweLNE7HmEBfICmRyCRtCPTphTl7N\n' +
            'u+frpi6N/VjFhfRbNXGJpr/rizJs743d/f2IPjhLSErwuJ3pchAdTjsXsybomvhkRyCLpWj1vRa8\n' +
            'xUml6FRNICbr/+nAF7N2/5uhGLnq8bca+m2gOeDE8ZedZ6R0Ohs335ffqdfekU9B8yEuuWLcLnH7\n' +
            '2FaH2gGjbtU9XpeT8aipSrdlXt2avfrqFDz15d/NRTIXQz0hO+F70zYWIauioKZkkLUJKkCJbwnQ\n' +
            'jwA994SCSHYZoUjEKJRj8HXVEUk//9g/POyykP77zHiITunFB0ue/si7+GjOwc1NfVYZ9/G2KJOM\n' +
            'acdj4Kh41Ebl4+VEVBPB5H+d49WL9iMdZ++j4O7NsDu90Ol8eL8l3bzQNlO3drTs/PX11Z/jy6EW\n' +
            'kJX2iOt1pB58T02oDfgHqP98Z6+QR8YlNM0/04cSikaRckEuKmi0f0DVcHfhUL1l2Y4+vhCIfD8V\n' +
            'g0GowndGdOdmbewJHjc6ff+1sMHTGKBMxBCqCwSn5pGySUMAy6m6qq9QbNjycSSCR08Z6iqeK9SD\n' +
            'SCFR+9hyfu/5GelembNrNkY7cRv/QsvjleE90F1Sx2Xx96AJITlWJI4ZOcgPzwusmjt6z57L3zLr\n' +
            '2274Vf/xYGDRsNU0+gvKwUNTWVGDh4OHr27Y/MDC95LbWG9WKxmLDiWPBS1NfXIzMz80vbJ6uxYR\n' +
            'n+m/5FjjYdC15+Ho8V31k1dtxZJz/0nwV70Q04/oSPkeJ3InM3TTNw4uCDlewiOYG59bJTTwkc2P\n' +
            'PGT2a80H/saWfB43I1zGssVo3/fSSMlLjxsvSqpKzB1Cr0TzO5vkGiFwyF4HQ68ezjv8d7c/65IF\n' +
            'YXvW7+loP16OIcn8LHSPE7UWGXfDVODEpomgzJCc09t17Qb8uyZe/d/dA/R5138TVwNRK9o8EiyN\n' +
            'aaRpZfgxDSewvmz8bOTatQU1WDQUOGY8Lky/Hm7Jk000Ben75Yv/wznH/pFJx7xXXCSmTLMCsri1\n' +
            'Y18OQffol3X5y53W7Xfqk67Tvv/P5310yeXhxBF+T4FT7wV6VOlTG/E5JiHP/uTj8s0fNDclxz06\n' +
            'RTzkO08ry6+kA/0iYXuSnjbo+3Qk8Ye2IJisbFQv/9rbt/Oezqb90Jl9sl4nPxcBBb1q9ERlYPDB\n' +
            'x2Emw225e2ycuw8PH7LHwshNXV1Tiwx49eA4eS3WBi8Xvz8d7cWZj2s4cotmfitVl/wR2/fJisSQ\n' +
            'c0Ws/hcByKAxKRcASrP/sIny9eiD3b1qJs5/Y9tdUHF3h8uQ/N+fiLTehCHNfCRydXYxr6eJnteU\n' +
            'IyDZb4FeL4o4Sm6ZCid1xzzWl9+2vQ/hqLBK867ZwLlUGjJ8LjcYIED2EStlB9LWLRELkngQFDRu\n' +
            'Lia79JQpeNl0mgdm/diEEnn4E+/Qsx5tTT4fV6Sew4ISUKt8vZIHYpay+RSEAnMWQxS4lCOBImiy\n' +
            '6AnOwcEsk4/TuK7KxMshJtXznW1LaE6CZ0xHUDNZUH8OGrz+OFx/+w88JvfPPs+4qf2IcuQrsJH4\n' +
            'sMfR/3oJ1RFSPHNNVx9MQxqVXjCBWUuG8ISnfQics4tG9GMm8v3RgiDzdoz98Ex/L8kDG9455vTj\n' +
            '5lxP6yHe+fedFlBbf8+H8xYNBwss40ccMWiSU0sbXGN2ZVvMn/M/HJu/OwdcMa3HDHT5FBYqc2Er\n' +
            'hQKILauloSsiy43e60jqOxODZFOBwWLtbG8US2KOsCAcz46bexaeWSH728Yt9f0EWwoZ2gz70m4+\n' +
            'bgLHQg4dneaWSD398iATRRVD87oyjz5kAJJCcix7K4AQtUCSSSFhKu2/+TPv37F/zogb+gZ15+k+\n' +
            'LDIrNn51asXrEYn779IqZ8/3+QSaKXWif16nKxazJbWHVs4X0pvncUjjY/Jb4pV2dj0UsNhWBhzs\n' +
            'jwIrdXP9gd7l7oQqjoRrhZWA2DrDfT35L1bJp5IqW3SySSbgwPNjfj+gVf/95P4MvNa3BLsliJV7\n' +
            'Kkvti4EvNfeAorP/0AC1//D/715/uhkgtyQtHVJDT9cSS9YjFigeLXdESv0fE07J9FjeF1G7tJU2\n' +
            '5Ohi29FHZ2i5Lbk+Zr6EK0m8XXWXC8rnpeznhnLL5QsdxOzSOtPolE0l3w+52hWKzgpPFnQFMtcQ\n' +
            'mFQohEIvD5fNiwejm2rV2OXgOGYs3yz7B84dv4wf0zMHz0WCgkaKYQoKYtxHRFr/E6YvB6o8Hth1\n' +
            'uUKeuvcSINi2I0HOKE0S5lZHU74WN8U2tqwrNdU1tSPzRp9ZVAIpFIujAbgn6bSiZZr959Gt7zeD\n' +
            'wNwxRGjZ2I0TSx4Jx61iRce9sP4aSYXWoQukkCxIJzeCZnCo7HcYwvGo2mNfShsXXHpCzAxq5Nrd\n' +
            'GA+MbLJhJxZPTohVgkUIA0efiee9yLF84t0JyOU2LxwAXRWOIUDfFMw1Aiuqltycxy/VtRC1fMXb\n' +
            'KkCq2kW7k6GyMyNQ11etorkNXHbZUgkUgkXZjRyIvZHQ5D0xxfsqpYXNiqspOgsajxv1kQs+m25n\n' +
            'I6G5ZlQas4WCXKjKVg92Mi+W9eh0lH9I4EHwNXe+E6nmIYRE2dyBg9EtFoHGdcdAVMzXHZHd+amn\n' +
            '+0bdJ21OLvXnfK1LF5f3jvnX+sq6s7sLm+Zv9LngzvD4aNHHHuqPGnjS0cPuwMX7bn1rrKqnfrD6\n' +
            '5dd9M5w2988cUXW+VCbc/hDH73jcFB6GTCL3oXsqils6xpGvd4bgrLVi6StlCE9Itgl0AOMJe0EB\n' +
            'aB687oH3j+/U1ud2bGUZdLxdIaW1sMW2DsFnWRVac2kxSjC7clC4EiBqGr6pfdlGwd8lCIlBvz8K\n' +
            'SW1HtHc53W1dWRABtYs2IxnvvTL0p8Y4ZfMWPG3DDP++lPr88u/WTVpbVVByaTg/Zr0Vi035iJp2\n' +
            'H4hNNxytnnYtjIcXC6PFD4mBQ+nihi0VqU+0vx2jP/wtIFb8Hh9Cy69puXXX7rvc8F0QK6pavzS+\n' +
            'jKA1DNonQWVaCOhUQikXRhfvntS/u5PB67Zv/y7ZkFprFbsXGcrTH8PrsyD3dPsttLEeMfVOgkcm\n' +
            'Xbt2Duvx6FXXWiz6DBmPrNO0hIbF/ZVmORO9L+mooXsvs1Gg3h1DMm4dMxE4pWL/7gt9dN6LctHA\n' +
            '5OXT13/nma0+4aeeoEjBh3Ki6YegN65hXAYXfyViEaTChJm8vkRBkndM2FYaNOxQ9/PQwTL7wA//\n' +
            'jVz8+b/cxbjz322I9+8OMfPx5FmnR74XPfHCghq68kLatPOSF6tEkkkm7K9EvG3r5iyeLfTzj/cv\n' +
            'Jl2r80L+XuTJGqvMKixm5HHqbQeNkULB2rl36EBa/ORn11FWprqjH50quxeMHr+M4v/oihI8eQ+5\n' +
            'S3+2UBS7lTDyfdxBgWad63jcTP63Fh8OjTsOi15/7LV9APY047C2cXXYKJ51yALF9P2mbKrWuiwb\n' +
            '2oWGKNpDUai4eR0EP0ahfnPP6c8zHljv+HF2b8afqKtxY/SguuRZp0f4uP0c2PyKYvSmPJQo7zKd\n' +
            'Nr5ABgiUTSZZg5ozhnwcv/Lo6G6u6aOOlruPiaG0l0mhaYVPIKC0Zj0UsNPbAGuHNPvSgCdfX4fz\n' +
            '//oygwXVN5EG+98BTGnXshid7JSdE7Mo3jhqKqy5cSV44+FpCFmIU5RutxkmllVTVKt27AZdOn4Z\n' +
            'QLJouWSCcNORlet08cY/LIv7QNzk7VDZ22w4JH8URwtqqKaNyqgc0Jr2dcdBkLnxKoqrgRLRC+bp\n' +
            'vc8mXUknSXDDqChZBIJJIuwsKFC22vPf+3mQUDh9xVPPMdXDzlG+AmsRyfSzRKUEnBiSWMKDPWaM\n' +
            'xcChaiVIYni4ODROa8S65CRmYWsjIz0a//ANx2z//i2u/cA5t2KHbX+PVwnI2SZ1Kk6nweifK9u0\n' +
            'nwdFFOjZepJitz4/KPkNWrN8lcypI0RTcIsEvTVEVDCC6NFonWIRypRjBSRX9XI07CR1KOw4WRyf\n' +
            'L50HfIUITrq65ACzg+LD4k/BTiTWtJRbEX0vPIsazmIZFIJA3Mefh/rs3wZk658/dPwpebi8KBgx\n' +
            'rG7x1pSELKujvSvMYNZA9PfklpVCoG2JhoNCYENbOJZJrm4H3zPrhV0bKFb+GSqbfSNuPi/TWffU\n' +
            'TClkDVgQoMGqOIprY1tdUiuUZLJq/oiRiJXBzhaARxOpZgXS2qafkQOehsJN79Bw9C7wEDhf4p4v\n' +
            'Mh16+i0vZGY9+Obdmm+aKmKDfo6RzrcSF8PLQhPMeb1rJk6sshDRKJpMuwa8fG71xy7XeQndND1N\n' +
            'dszQDzFOySTIna4ePvUhzpvVAoTCIVFSXGWrxvEqJY3BLOjWtW4LWZM3Dlzd+1evuRQDkoVnnq2Z\n' +
            'MpvvdveJPNbXXdROm+Upj7TRIvDfFICDs2bkIZTdvXrEJtRSWMcMxwep2bDVVz5/TwDbK7PWTj6L\n' +
            'j5x/fglHPOE9YsW4l5Q+hBwaZ5nnsuwuMz0sruPE4sPolEIumeKIrqUhUWCcvVyALCVt3hFVLSob\n' +
            'El1zgb07LGlK90ZUjh82ULC7HxOunA29p/4ABm/+1BrPnkXXHct//8QYw760JUHqwUZdS4uHb57l\n' +
            'JUlZdiwMhbD61MJxyuq8LydxeQxbYDNeV7UVVx0LTZ3dt8Pfs+pRvhV6+49Lu7l274OHfPprUfj7\n' +
            '3s9MEZWZmc3skBQDoHG21fQX7vfnSyNs/uTe9L4ZNIJJLuQGZW3qI1ny44Pxi0OiqkRK+yspJcj5\n' +
            'lfcUu2xiLkkmc8cJ3XS2WDNt5WKmO0sau0OXRuPVRXj7lP/gnVe3ei+IkXkdEjnwxAjY69SsT39H\n' +
            'gcZTu/wNO/uxtTf/JjeLKyYFC8LhIIY+PixWKQ/e71G1Gxe2/CZlNXjxgz4b78Uy9fUlxsNbCdu6\n' +
            'SYX/bcOnnE33evX//QqZdfhphijSM0SPzY2szq0YOP3bF53Zq0R+QfF8IXnu0qTHdZ+pr9kEgkki\n' +
            '5CQZ9Bz69f9fE9S99/03PJtd9oSCTpQTf0w0WIhamxO/NoNLbwGB6EniIlerwMJ8ikhJano5U5Ew\n' +
            'PiXS7hDt1dWgon/R0lUTu4txSrFr2LP76wAKrdKWJ6Xq8LwUCQ3Y+oPngQLz89A6POmoi8AQWiwH\n' +
            'bt/gpUk3W3fdXnKNvyhanYbCvs9sz/m7e67DU6XgPzl35l//XhujeCZVUPTqRTikXjaFyN1O5w0r\n' +
            '7ttkBVXdp6drxYfIWQSCSSbsifX35v862Thv/ug1dm/e6y678l3uPCzi6P9yuuyaPF7Q7nSMvxEI\n' +
            'NUticjyp/Z7Q1/Ny5AfTgsxoyeiGP+rMewZ9cX2L5xLXkc47j793+D25uJYDAoKsDw5jm2p1M8Lo\n' +
            'filn0GDEFF1VZhae7ftQs7N27AuvfeRzQSLXd5su5/5ervP60UFxtNnZdid9TYVFskWF3jxkCIjg\n' +
            '+a3SG2qbHrk/zFPR0Z6TUZxHEifPRVFaXrmc6I2GRGp0Qi6VLYlMR7VQf3/I4tIgeJ0ZplH+H0SZ\n' +
            'eSECnC2kpZbCwO6RaW/so+jmDNNV6uKVFNve/2ZODu3z5OVmeE3KdBGByY1IFAIIDc3FzU1NQgEo\n' +
            '4iryf/XYsoWYCurFxUrtmNHeTSLNu4Hms+KOGxhe8PGDruO0+9sbhUWVmM5pjyvTvrXvj9r2uq95\n' +
            'a71dNsiBs6nFzJJRGGnavLkNLG7JG0XZ3HxTg+Oudr0lzULwevSySSrkZ9Auf3GzCcrSDU1tZi76\n' +
            '6dNO0QgsOxObbWGLaqUqXL2NppPO7uaGPwGDGm77BEGWs7utgWDyOoq61uchupdTj5prq2nkSNXK\n' +
            'UxrqgSF4PQA4EQG2Iim1McL1ur9F/fgkE4ULoLm5Z+ho2LPiE3qfMf3/71zCtZ9JAmt956b5A2V1\n' +
            'VeWiasSY4NqqomEoLIz0l/KwhWhx3pbq/bW3zJ+F5affnoS1sDiUQi6WIEDu7/Zs9zL4WXRC4QDO\n' +
            'Dk08/F0w/+CmdceDkmX3UD7E7LmEklqHCySsrKSo3TO7xsWYpoJIxgfQ2yfHkNJc5C5Epd8NKz2L\n' +
            'J+NfL79EWwrgYjxk7ExVNu+cr6LLA8zg9iMLxdCDNZWOCCZBzHM2I6YiTYB8t3w5ffBzaK9VVX11\n' +
            'iNb8lFKgRVN7H+k8Ugx+r6jMHDf3HDDTfE0ELcXnclxxbdHreoCEPmplVUm8VP0WCqijPdbXV/i0\n' +
            '/T0u6urpjKq5BIJJIuRlZen38sevM/2LF9KwmYjtw+A/Hj3z6GQF0d3pr7r4ZYX2oUOgscuz9Z9F\n' +
            'jwGg9VSHVCT1G+pwxvvvAvvD57lrAYw+Q6nTnjt4iTu/KWO+7BKSSy484uwkXX3Pyl9Xg7dfX1OF\n' +
            'hZSa8BJOJWGTSO94k4IO0rStua968Z+N23x+ORu87Gw/dNI2tKR2ZWFrwZdHxklW34bIGVTUr7c7\n' +
            'oyfzP37VUVaAXhYGhvnEScXkm4+HytcmkpG1ZtgfB1a4tPWHsmpqW/hl4CiUQi6WLUlVf925mhXf\n' +
            'vsw/970Tfv/jV65PYkN56Gcy+/HjN++l3s2rKRhM6NoWPPRNEVXxcClLLe1GTj2cM7obOlxtOAQU\n' +
            'PxjR/9DEs/egf/+P19CJD1N2biObj6m9/nnBAUDB7ZcByplkYcm2Mrz9qmKlyJLLD1JISRqFWH0+\n' +
            'V2YdG7r2PJvEfxpx/p3Owb8z4uwT/+9At8+ye/FUMNFi14FSsXzhfbddodoRFnnPcu1sxFazB0I8\n' +
            'Dj92yiZmiyGS5SwzLATwNp9+br3q5O0YE9TUyUiOa1EolE0sV4e1tV3Q+uv37qipL56/sPGDQwv3\n' +
            'A4zr/sOr6Z48f/9zfU19XDl9dL3OErDlbC4XSQuzJMOsBuxjB5szQxxEDRbOQudTb00GOLUFiK9L\n' +
            '/xZ07GGeddKoo9s4uwqqoKWWSZpdyjvFxtbZ0QPZHtaXJnBZsQVWt4hIpwONJQf7Oqqhqfvf8qJk\n' +
            '2I0b51cnsquOY8FX998RncOXUhbdeGUG0Vhp1xOjZ+8glcnqxPHnxqbi1aCR1LxOvNgtudQeepWt\n' +
            'mjdEyKOD8dTsM4/oUvOtdzv2EohWmvYOIZtDNscdLXXaQqRg75vAeaCkQ5NHoYqdENkxzhWG0m4v\n' +
            '6MW2Rt0I4k8G/7OFWzFaW+A/786cFwjStif1UmM4lrclxyGpj8N8OfC9+EVicnP9KnMDmtTm7nWF\n' +
            'HYaErhh3VM3e4398TcuYHpV4x9YMl78/511hU3iiQRM2EgL783snJyRVxvx4bP8f782Rg2ejwWvT\n' +
            'UHWuQAMuz14ERP0zUME6/+Icacdm5Dl/UULF4u16Eefam+fo2TXThhhMfhpeDEFE5kYRHUaZ4vJ0\n' +
            'ckw3DHdRZVUd+TJm9PG1wZKuw+EqC9Ou683sDO/Tuh+rJgjHsSK5auwCaK72V43W+jDZDYRVN+TX\n' +
            'ZwshWqpzoXkRqrDmfao/q7pfAlRa+4Bav43TcHZ6EdqJ/tKrKr2jXkRZ9G/8xJtoS06oYf6pkovh\n' +
            'SBjZ7M5jhqaIkS01Bea6/jOBLccimSEbsLplJo3fz1RzvKyuV9hd3RaYqqjk0JTWvP7fBtJRKxZ5\n' +
            'p7WBBubpt6G32mdyvJm3nqOxCv5O2JeOL3h2d7H+jIz7yLwp/HNJo427kozXX48+aeZiU4ugjydu\n' +
            'cdts1HaLoHreOu5LZykvt8AM0LMC9/G01TcEjEjwSLXwlNr9H0Ko6tQKfNv95c/cyVY3y/rqutLO\n' +
            'A+diw0LDxsjS384HUSvxpsX7UY2dVz8dPLDHgyeNC5LkTSiFfjzUWl8Gf9HVmZWcjOyW6I+7HIcT\n' +
            'd1hkWRhSuHhIznN5RI08mqo/fN5CB57pRgs9mFILKlGaD4IB8Pz0+I8X7W0Iq6Onr8d3CGpQ5vPs\n' +
            'UAgzrGknGqeeqwx7YE/YeNpHkmIrq5E23AiCfChpG8ybKlxxMgevWxSBtK+vXWupXw8Q0ySjcz+s\n' +
            'zvbtGKhvhBtYnAbO80TTXvp0+80GqNmD58YyZv9BS6GU8Jz/Hez8fT3jdjFoKwGl+lGMohEVC1u2\n' +
            'NzvNMcNwbb1dpNfg8L6ZlrXGOhCc/1DHRfH2rRZ83HHVFjvK3C1LY0m+Pu8Fx78ZG21SDu/OBjNP\n' +
            's9FNJxzQzOyazx3lh/oiQ2sZgUo2lROBJsEc5M/j0LRxYhnl902Ht3J/c1HS1jRnLdxhTRNBlHFr\n' +
            '+i5DppZXAnj2lKcuIEuFk0PYOWWbadDlcuuWZc/ocud8atDnIzxmM6qqprUV15AE4Sp1f+/jBumX\n' +
            'QAZ4ziJgSGEACVn775Tu40cPVZe/DHJ+/GwGEL6H1NtB3iKi+15Cpl485MVmdJDVxnGpcv424Jny\n' +
            '9+H28+9wjssf2wefrgnKum46xLrhYWXqq6i6ZZLkZXVg+Ub+euQiSWdVxFxYA9Q0luT4E7vhXe7D\n' +
            'Pg61eARLDFiZyHoUa5TFryc0ruwyqdxpNdU9LWs26R1clWFt1U7w974jtNtFD02mjtiX3P8eyk73\n' +
            'kmix7ajrgZkwDuJGtkGtoJU9XmKUe42dFl8giLBdoRfvgwj3QDIjGqn51RhJYgsnKVwnS2JUTSE1\n' +
            'uFlln79APVp+H4h7+PVbAssLZ+39NoWph8TVEIS0SOtnxL9lmEI/+OC3FIfBu/tzA5pSt6R9puMb\n' +
            '56Tl0Sm8NemZHtAwsfj1XjRBKHw4XZf/0DLh57EKeN1qGQbrkKNGT0V2myI6OfHd6+GgmRhkxtN+\n' +
            'qrK8TYuoRuNAx6V5NZkJy80jgLlOFXMZFFt/7TD3Fe/7X432+U4a7Ll+KzF+7C4rdeQWamR3REYL\n' +
            'cpi6CdBDAjOxeVtRodJ1md5HeM1Df4IumepJMbls6BDja/bz/E9Wg22gDFL+nQA/R6qGAZ/7/BsT\n' +
            '7ofGzHZBxfIQsE2hn68nLEDd1omZXVgKFPRiuJzPHOaIXQposlgC96J7mC9nvaEouqnpeTo8TiR7\n' +
            'wp0PHnBF1xvmHNQjtBX0XR0b4Lm2KyG6oE6dJEVq6m6ONS2wq86B3H3h6lFTd1+om36QfXDWitld\n' +
            'cUhbBEaCwsV2ZhM8s3fFdpUJTmvCnJY2iv8ypMbm8SrHPqku5PEp8JHorHsfCRRgm35JIP50MJ7M\n' +
            'DlZ1JszmbCO5quao3ujtWKSCpAUsBcPbkbOxAjt2aEYoLs/bOxmzPCHdTtYjxdPG41t2WhYxFMlS\n' +
            'Njl+GGlUuxb92/cee0BBIklDmZKv7r5gR+8fTvcNZlV6FXfh+yQGuExWe4nGJIRCRMFqCdXJ9RE2\n' +
            'VlGgZ4DTh72eiw+rNKwkMWZ0aOjwTdOwaoRGvJysisCdTU0udj+dySOTvW0AZSvUQ8nl5vOrS7q1\n' +
            'MpRDvTKrFLQnHAB7ytiHEJd5o3Po8+2CJ0NHTjp1hUEVkzk1sbj3NFIjmWv6NzoEsup23fTHqQq0\n' +
            'Tc8NjSa63oJfHj+IXdeMXoOFKuzHZPDmsGFvNH0DFMQ9Nu1WNKIBjqE0vED8XmImEsffdVjB8VA4\n' +
            '9VdwygwACJn6jUbEW5KHBH1hqJD2pVBKMJVku6JajCBUjba6j0wthSmZ4EW4Ipy4/jeptXfYb8nD\n' +
            'j5LEm8+g2B6nRD2bYeXztjPxa98RKunf4j5GRnie3V1NShbOtK9OrDFigJrFNBKJBAdZ2GPGec1o\n' +
            '2RONfDRdtw+3J4HN85aAM2p31/1f4DMJLCpypqw/loFIusqw9kpbut46Jk2ZGgm+aj3psDxWghqf\n' +
            'gVOkP0DkHWn7awJV0mThSEm1ZV2yJ6nOrc5hhvF6WjRS/FtOS+Ogu29DpK9FIUwnJ9tmsYoD1wOJ\n' +
            'x11fv3IEwCZrc7hDDV1VSjXz6H7SmWlUmaV02XdTwpegoJnousPxI/lf5m3YuF6ii2Z3V54H54DL\n' +
            'smhfgpiqj6wqRiZeJ9svji5MJMkO/Q6SPnYVCHrd9QqJkazhqt4cM5f8L2rRuFq5PrdPK4wK2rl2\n' +
            'LiSMsdp7BYkin12WqySkmclHAZtNhWZJAoZffMI8swONLkwF8r0Q19fzxBLtUEH6sihlWIZrQk8B\n' +
            'onAsWCaXt2jst+fPRZrHbfFGiVizLsic0kwzn9WIJp+mmPJYZp7kq1PKLnp0KFO70rmKSkH5cQ4k\n' +
            'c3+vEyBf8QHE88oifBRImhqI96QloJf14skCGPXkSPg1NU1ZzE6/B1QM+FDzhvDvpx/FGElokeX1\n' +
            'Ov0rQLh6wcvukXwnL9NXedFqHzmJHGMnw+fhwatpCDQ0M30hWzQlhZqq0Oh3QEZjw+f/F7r0248p\n' +
            't3oP+AwUKc3Jk+7NqjUeSGBIBcinaf1X7cCHIDWwfMerLS6snppyvo38+DkrdewslnToaPLC0uH8\n' +
            'bbCIYCWL3kQ4w/+0JydzoQi+si+YWFMRKJIcObASe5JXdUkD1kIxGsOgi32h+ufjlI1FXh+nMr8c\n' +
            'D3voZTzrlEVJTZ8FkJTqZf2bkTrJqcXD3M5TXx+Uc2TLnQSkJR4wfgtdWib+EgOvZEzuPFP+5Hb+\n' +
            '9GKzjzgqv2vv78k1zg2opX8l5Ny9OrkRvX5nD3Sdd7ffwJH90QnWH7VLSC5DCJKWktbFLMzFSecd\n' +
            '8cLGlqMbbi6PmnmDwPt6F5CqMkvPTaquM/3lA1ZaD51Rign6LZ0903B0oav5l8WHg1OR3vFOKrSS\n' +
            'BHowRWhmZJGtssBtK6TjuawibmzYLldi1pYpkiWFZqOufCyxajcyzntOg9+oy/7N+4dNKTv/mvC/\n' +
            '7nsdkii3LC+RfhjSc/wc2XkujtIytumCEMPVEKzN4HNrKuTHJ/Gj4Dl18cwb2/fhlPPZiFk089Hd\n' +
            'GYjoNkQdZXH4R/81q8/LeHcOfvnkC/QSOhkquThzeESfg4ezSzZwF27zOQYF+gEYURIveqLx/OvC\n' +
            'qcMSqBfnl7sWrzv1GnJ3Dm5SbOO9VEdi9raAFUA26yOqNhmmgDDh89ywf3QjO3I79vAQwKVq757A\n' +
            'OK87VO+M7uO2b/m4qSMA3Dxp3dRQINV66hfdscLlQFDxaku63jytXJ7k33TcHJrbGYAi/ax6U1Np\n' +
            'CElR5dBtF+vnLzPRIct/PeHJzG65BbvNk4CQ97CP3H3VEJNd2Lw0SPLThXyD4+nc/9OIfdjoXNLM\n' +
            'O/AX6AYmumBM3jhyUWg9A1Y6IlsI5tOpo/H54/DemfC3+erc0YbXeenvtu1cRJF1+zYdVnHy//+F\n' +
            '1RKuz0C66GLbs/Zs23I1pL1lhAbQjxqc5+MOlOrugU16MY3wASood+qSOy/e9488nvYs3L34ev9H\n' +
            '5c0uNx3DV5IW6bvA0P3XMbQvV15OJMiPF9PECdXaBDR5yMAG1nh5+HLBj4YvVmMqdGw0mWnXuQgo\n' +
            'GDTFx9YRS3XWXgkgsV5AykfXIupY/Wt5vgMeS9KNK2Zj1Zp+6+onOCLboHroxM9OtfQPusH4xWMv\n' +
            'H7349TzDPGBbG9nlQeiyk+g8zMLM7ezkh3W8eF8NGp19DHP9XTSvcmo5n2ec0tkxLW1iShHBJApd\n' +
            'l4Ez3B3N/eQxCOA/zOkH2ydAMLwZvWzDJ+msajddavP7luZyezNAX/ZlqTiOKHJX7pxHjTca92Gs\n' +
            'VPzA3k5OTN+2LNCvHv/F69cO337sXiDSreXmJHbBfEoHDYFOHyg6O3iHtZwbYECvvF8LMf6/jTb3\n' +
            'T8tDiGK76tYujFg5A/zsCE4QkMyd2HHRuXkbXHY/wCYgA8W37enAw43F6K4XElFBOlm3fQPnpTmN\n' +
            '0De54B70kGMk9W4ClQ4OI7FBeIIfemWcVFq/Nhd6s4aaiB5Rto/YrFQCIAe7wCLoeCzNxchALBQW\n' +
            'gDhqLoDsXOdT/FuZpiGIMKp9fD5592hl+3Fz4hRiH7IGcbBigHxHg6pbCpZThDtC3CmsLNCTfNiB\n' +
            '8PQQi5YtLqS8IPNjwsRYqeoLkkEz/anq3In/M0dA3x499KMdpGMZoXvyJ0bhyzWVSXwx2oqxGZnR\n' +
            'yrO33yFZhw4dfx7HwTW7dqiB6g+zxnd5phWjgDBsXlTJHd2QtGxkjOe0TdLisDVLPHaBEfnD7SyD\n' +
            'wTl5xpYP6zfxMxPpfTLoZMcO3Pvbu2IREOiXGCGllvVWX7UFERhqHlA3EVJpkY4HF0rHM2L5QoCW\n' +
            '+Q9YbjbXE4vAr6ZatYtoreZzOUWxfFSuF0ZMKZlcGuyZPQSkRijKk7fBk5yX8nxx/yPuw26KaZ9g\n' +
            'j5bil81o1QeYDcXj4Wo7beEK2KLE3tz3y1NRmiR4PFjwUbTR6Tcpe0+ixMQ3lUFhgXFKJ5a4/dm3\n' +
            '60D3fj2Lo9+TdSjPahGM27SDszc7VZQlUVowuHjxQZl1yYmrszXHXbXcgfchKefp2Eaq/Vi86MV8\n' +
            'N0+KDqXKePR5jvJzHaYg3ujsSx9AOPSH80lTy6seSAQoIYPQSo8K/Eso8WiPZBmZkZqKw4gNf/9R\n' +
            'hZZyb65auwZ5jIdJqorYqTEJ4GhYwsle9I7F0kYVRsPjTUaQQbmrUklgZ8WTr0uInq2mSNq9g6ZD\n' +
            'ocGDr2VHo/MfrJ4mIPWsF/33LlACNhODLIrUk7R6ohEVurwWCATzGS7ra6vvCZpt/kzC0Ts0zTuI\n' +
            'cEb7LnxqCPxaM9LIA0rD2/YhitrUV4VKJOWzGdnP9o86XV14C/PR86ujnNXQ+z0L7Fmfn3NR3HBj\n' +
            '/av3gEn0tT94widKHhDfFYtCA7r79wR3LyCFdx6du3L6Z+53+wrVzDoiU6zATnoNRQnK9AdF3ghB\n' +
            'fVnhxlm6wXXLY5jroqbmEUhqKR29Jlh28oxevyY3j43u9gwbwX8OFbr+DR/56GbeuX4JLzgd69DX\n' +
            '74RkFvHVs27IGpkWjCDR48qFcqVnd1svgMNdkCj42+bF2MM3TRYsMLDKzdZMmiLVENJ0ox4KSRiM\n' +
            'YjBe8veLYnWsHurWtHccZbz759IKRLsQbd84NBqLKWXLSug+luqz2zOv3uG9vmvz0W2FTzGrOpwd\n' +
            'iirmb7Wxu+qTU14dkZ06GaC4+2jKoqnJVWjBMYwzC7UqzpWDOpiXl8Q08nltVSSpJTETqXjjgXPy\n' +
            'wrsinLbho6fgxhWtjsmpMrpHhJ+KKRqBg/Z3fYMWDoSfDl5mHN9lJcSe5ExYjAdPHYbY1ckoYo6a\n' +
            'UkrEaxiqbAS0K4dIWCS66MkVjxLdoJLX8H7vtVCA//OYC//OJ2cAlMX5aGO79tw8Xn6Sk/InJzFX\n' +
            'y0di/FE8eQ+PUl9+VWaLm0iZBhDaNw0H4jlWIwvRnjCiosvCZGDdCwcYeB887WoBoJaJF1yM+bgO\n' +
            'y8PM2t2vnhohQtpD4aLBoxfixcnky6YxtW0109Tp9LVHSQt9vdK9Pd1nE7gD1dRPHoo+PvyMr+Ij\n' +
            'tRadL9Usgtd3ACo8KYBQlTiKYzDznG7UfH0BEi1BR+tGOJvcNgUWvK6rsGXYREXFm/dfnHdGOPkw\n' +
            'D5kJ2VyWPMUVdXjWg4CGemBs3L6fxxEh6K8zlJEDJJkCK2Bg+kzaYgO0PHti84EYTMQ9tg2vBmEq\n' +
            'Na5PZK4Lc/j+GfD2t4/Lcqnv+biasv0kWLIyUpDW5ySpZ+sQexMN0p7cORLBZmKQcJrmLLFctxP0\n' +
            'A1oon1HBkKBvU1seELp7BAGS22ByqJdsHQwazJI9BCvnH2SQONaPSO8674Gp2vdX66HhFuzt3bdq\n' +
            'C2spIH1a9Id3sntPCFZ7uKmlzAbEHNyVZiGsZrTc3nPnM4cfHL2F4DzT0AdaRlXILOjfV15LnUNL\n' +
            'P9LvOgmenr+Yc35z5T/sSv/xvrVn8Ov38HPnjrZbzxrz8iwxnAt6bBSm7RyOUZD5A1NwCottY17d\n' +
            'mW+NkV9O3pgH8bF6AO0RukamoPYZ2Z3HqPhKNfLx0jhuqwq7SMYoju5pbPlKu9mIiHoqirJZGx9U\n' +
            'sG95CsDq2T8DWuEiaaA5HwAbnZBnaWxlBVZymwI7yT4ohO5PTpQ27X/WeiBSwsLrYFgwcfHD3x9K\n' +
            'zzr5oCm2Y5Krlt0t7y3diw5BM6XDMyYsTpO9Ld5gktfAbUoqbmJ0ylw91sUadzVlPz6QlqLE5UzO\n' +
            'O6xmZLKWpiXqr3XEfyGjqPEnQsTWWAsxtuILoAcz7dtt2b3fuSj9+c88F9N03Cz26ZjFm/uwvb1y\n' +
            '3F7T89C737s5vTEO5MU+dMTA6dJcM2rgIr25Hcnm57FBV7TdRUJ6wRD7ZeEG5RxRSuSd3eg5ckNe\n' +
            'BhEeRCJCFEhi6Ek12tPbzAlk37adNkUWqHxoib7GJVMw8dMLldDe8I2Cjs57SryKL1lq9M1tWMrk\n' +
            'MmeThz+/WnPaV/T3vyyWLP4/P/9ldPdsaN37v/AXDnIe4ez3yxYSW2blwH/9qNdFwO/zWnnFWR7n\n' +
            'ZPaOGj77TJLyCzEwZKc6yvySQXpes8gR4D/JCkaOpm3J4JLcdyHylK0LE0dy7j0UWYt2L7+nFT77\n' +
            'wkN7/gkmhdjX7bfT/Dw6+8jrETh0NxDIQOirPZuDPCQYrz9WzIVlDqN4i/WYTYCuvbx8DKZUG2jO\n' +
            'iekk/rUtyNrEGDOzw4fDCc+aJzg1hXZI0k2/7Q/IJ8E58t2inqgJq2oeJ9k0RSNaNkWeZ+6XjVkF\n' +
            '8IqEqiOri3ijVbeHQ57cNVDbvhx7CTR/NwiBGfvviwu7lzv+Pys8a/9KeH3vX1yr/9Z4/9Db4eeR\n' +
            'TH44RQFdXV5Vj+4QL48vJQUVYGjzdz5uTi4gTS5IQWPlNRjprBZXbiD50e2j462jy1+Qodxy1c/x\n' +
            'SSFE1lG65Bx1OCzqEzfnepOp9HoxBdiOLiYqNw3FkrNbsjWDBwCLxZOeTBrIWpkZvROUkIIGJVJE\n' +
            'I9uWKmaApr5hiiiKXDq4q+fP18KkrLQjSPE1ByhRfU5JgcZ37qYSjeUeJvJUaW33666wQ0S/zsJv\n' +
            'rkGuRqLSPPJv+7v2UdspVJrk7VkUXia9UNFW5SI0auSAWaw0Tvnjq2l9L+ozYoATqy6Hb06lOAzO\n' +
            'weeX994onco53v7VcV9bxuYv+Hd2xduWzyNVef+8DTz6J3wQCSbyPZbaIGL/3tEZx0zjlY+PLLbL\n' +
            'XWZ+Xnv4gWcGInt5hm4dFm0TXTaYOlFUU56r7MLlg9XnJMKGxiXmdcq531e+is/fibmNflfnPXnX\n' +
            'JOnRmPV3+xYR25H210X2CDSRPeSdPcCzNRTy5AO8yek0iAyMwLWoE4zrB00KK9ySPpLyXh49JknJ\n' +
            'bJXRlUXbQf4iQVeAuTLf0aWXu8CFmFPKavvjqK2uoIzSW3qOq1KkMjQaLjpinD8rC6yLb0GmIYhe\n' +
            'ZWkE+67N+dwHaOLyIOW3QXnC4P3FlZTrs76yt1Na+fMDj7a6f0/m//lqUbfX1y7/nNzOdt0+/9uR\n' +
            'iczlvguqTVNXvx/MO/Rt8hg3Fgz15sXvwxVE/Gb2a9s9qPFnDCZ3U2gR+dhGmaTf7YzZddXSLmIO\n' +
            'my+NHxdAVBOmHhOpW6qlZtXb0KNpsDCbLaFHY12si9qZDNZZKo8aC+uvVQ4lGaLOFjMXNlaBjUT8\n' +
            'G65QZJFVl3JguVQwxI50a1SiIKMUbP3kjvhbCZcDoUZHnIkkMUO7cfFNYjx/mEZcmCqcShOLPEvp\n' +
            'SoKZrRskA5XAaGFPD+VazbqIlYpKN+IbxuLwaOOgn1B8qLUrsqvn2C59ozC2+srd+32eZUH7rpp/\n' +
            'fm/deMx2k5skI1TVSVYfaXleKxe3+Ck885H+78Hpj95wcR17Xlp0+56nG0ECl8EolE0g1weZzrqv\n' +
            'aVw25zISFGOcUpiJcPw8aCFSOXZYBcn/lCzFKwCGkeE7166Mhyx7BpzUG667Ng+YQVxR0VgBBpXB\n' +
            '0U96Fh2NzpwaTYnEoWYYbXhNeuYf3q3VwJm1ysvUUjWk4LNSJVdAw9kzk1FDM0ks1hXSr60ds9M1\n' +
            'Vs25sQ2aCavguZShSFo8cgEo9fziXIbjx78GmfL/UvMyK1sy+57Vu973rsMeXCK69FD1+P1BkgUF\n' +
            'ONuU88jjl//Qtu+/n/YFeZH0///FdIRPStBQWDrikunpV2xZYUx2U/vvaAvnYfugjKdREZ65I0RS\n' +
            'Ekxz02zf5ZOFh7azwWR0Ibj4TpJGcnW0T5FGerIcutDqabnEP16yHSNZOxNxYhjvT17w1UVkRE9i\n' +
            'XAjQw0y93Jsbk4xQhdfSgW97no+qDEaZm4IjJG2aLsT+7OdWvKaMbZtOk81AdtqNgGDOtZT+v1gl\n' +
            'LPDWHZwtPF9jWnNQB+cB8da9Y5YNg9FA/sASWyEgOGDiPhMQdPPaXPP6PhmumnXHShct51X0fhoK\n' +
            'HIzfaRp5Tjh6boIL/q44/w/ktzcOZVV+HUKy7H3H/9E6vefhv2jMzlYT1x7VPvfl6OVnBiJ7fg6L\n' +
            'E1+rY7zb3YXHapRIKmXY2dEZPqrOziztpPt4ud2+xZSysrDprlO3dCtXkQ1c7nVjykMzkIVZPQxC\n' +
            'qhuvvTv61SmJyEYnpHiEQTrubSy0fuzjXlIoRnatlIjXJnjTQjFaLeJwwuLm1VwRTeThJF7tIwer\n' +
            'CCin1RJOIkbLZcuLwaNmwmOY3TZenqb21Hh1UvlOBWRTy4fPQwDQcrdWxcR8oY8MMeWou+BYWwe5\n' +
            'wFBWOGfvvWP/xBueo7t2PMyJPRMycperTftUuX4rGf3ofSvaW46kc/xOrlS/Hgd7/NolftcHl/2L\n' +
            'f/WUUl28Kt6usnjg8nMGoTwwg6M5uyq2SXSro0/ibmFaLj6SyhKETn0JTAdsnfnNvl2EsP5KFtm9\n' +
            'fBTtIUUweQSETo/pGDaC3dzYJ7SdBcMO0ukaBiOjjRJCqEjYc1+DIULP/Mzx1tRGZnQ3kXjfxbZP\n' +
            'EpPJ6PBNWq2kLrk0FoiM4OCgr7GTiwvxZ7y+ppjgsOuw+VdbRYvJbWcYiYIcOuVd6uyo0j7CYyXS\n' +
            'TMpKA7ysgNysMEQysozmeiYPhwXHDLNzFsxEkYNGAQnC6XqEcaCYXw7MMPYdWyRTjnputQU1WJx3\n' +
            '54Jz5/4806I6E/6u07ZPTrG6qfeOqNN0JoAyf2AHZTOaoLkbMpOyOppHpeTg7trOho8zszu1TSpW\n' +
            'nK3d1UDc/2ogidQ2cMIG/OquySv7krflBcBT1R6d+6UdTJNLSJMPVqEWPbc0BF/Z5yqz4nuRq5eL\n' +
            'NioxhgZKewomxuBT2zEzi4L4iK/RQLVH0NZcm4zZDKblJWyMbj8ni2zVo31836aGL1Cj+bi7Ttni\n' +
            'jbS2IWPACVXaeiG61V8YWHNbDw2p20XpYqNrOnwqpjbYushy1eh9MnXQCf04P+ffuTC1cTglnu34\n' +
            'lZD/8BI889Ex6fD0//8pdY+NzsA3rCfKDPiLET3lhfc/criza1yrV5OCe48DX9ZBeKqdPRwThiel\n' +
            'FT88ld8BHaiKoYckhE96epa5W/3yJ0LJ0hrimmomMpamZ+l7T4brjhhpjdnbFnA7n9NM1OwpeHOM\n' +
            'X3FHJbBnUnDu4JAhXvkhjWWmPygpoVq4NlfQ3pZxM3vTUr/SRQ2SLhhG0+g5NhjDBpFr26ejfsT0\n' +
            'mQNEZUshYNsshMZHgMssR2W/U6tXzEE0D5LooZVi0moYuKdYxMmpeliCLSmktB31xTVHEpK1OT3S\n' +
            'MSJH4bMWbC6fBv3iwKTTPB+gBenvkPjLvsMix95x288Ze/xvSY8uCAk0af8erqA8VPz1+yDe3ICS\n' +
            '18cZf91abmq5rS4T92DfptTc2nZ7ESNEPE5WrmCVUtRLuiFELS2ZQ0M78IHUchOs/iYzq6UPRdTc\n' +
            'xj0euyXhYSvAV7/NtFoWiVhCuhnixcjwNH5WEpHblesYMEK1nAREkV1YQwtzLdHOfTsdtP8TbNS0\n' +
            'aZQ1haKz5xIlEftRa158Nygab67FnJMXbSzIG9NKxaUQpdVHjxwJulY/1KcrXWrYbVA5aEMkQ7Ci\n' +
            'miGbpGRqDToaOAtHR3hSEqunB80VH/Drzk6Cr372ApFOeyeslHOP2qK/DuP5/GqvdLVrk8vonzPt\n' +
            '/9s7+/Sr7ZDuCEFj5RLqyp7gjkgqyfnVGEDiI821XYVHcIukZq0imbxudhNvljPfpA/ZYSe9HbpJ\n' +
            'tIVlvpMPxo+obMN/OOsuzvR+dShI5LcpmGpuOIbfawdCRZ2b6PwpF6VB88QC5CEyQrQqPyCzw4QF\n' +
            'dHWD0FppPF68ut1hRNtFNA754KNq4tF/MVxSXW3bpTR9XOBEyD4oGufLbVkpkt1mZEB3fVwIDeBs\n' +
            'KhGHZsPyCEzZdpkosVJL75FE/sZUkli2KMVsoYCdWdA9XQkJ2VQDRkNiTNOEKbyHp08EB24Yatrq\n' +
            'yCO78n3nv2Gez+Yuvi/F6DLnht3f516EBkW6JmuiPYVHMmOmrfqjqjyflmk8V0D8d/tBl0cbWb5R\n' +
            'rTm7khmTIZpwN5pol5LHp3o/0pRPNd3zuCGegYmhPxWejCxCKB3YquGtvWkS4oZKkpOUKotMz+SN\n' +
            'g1qC66DDKGWGP0GsHixeYWJ7hs3FCGSIgLVlvZnwqZc7GogUSA4nw2iv05c0V/PTh1kWHJA8h5PN\n' +
            '/YwaYQyo1rdgsBy8tXUFFH69UFRPd1XsnMpokTWkL0/ButF50enDwmUPhHLQtUMQ6K6frv/0CUPa\n' +
            'uLBLBiwXsoW79laV1t1VWzSlZ3uMV9wgsfd0do2lpCYWiOt91/hJEX3XcpTfcCpItMfwBpYhrmUe\n' +
            's1cqJOe1muFIdu0jVrmnE/JB1Fcw9CbPUVon3pKAFqjiKapqB9YdErbGK+H108i9rwZNfZ7fbgru\n' +
            '2byAqzk8WXBV2hwJo6EG6Kp+1ZtQSJCusUTBIrrtvJ1huFBJEwDJwyxIF4xMQ6tvq0PqICC9Q4du\n' +
            '/XEavdbxl6nN1JMUJT9LY1hDvU5iDLjWJ8TooV7i7l5Bg3WXwG9lXSfuoptqhHLIsuoFhVY4wAoo\n' +
            'GE6B9YH7AjM1tLGqGmqDKj6PV0ezOwp8yP5R+XYPGr8/dlDRl8ZYm/c9zMJ7zwsZtQMcxHm1qGvq\n' +
            '+7Y3O8t6GdCJC70DTVR9DkPs1XW9KLji6nkqbmk1ukze4q0b/QbDLW48+4JS4tvo6jBE3H+tjqW4\n' +
            'j2c3nyNdPe4tMS2NtSiPaBPRXFzSzT2Q13W8zoohsOKDZtw77SHZYBpWpIIJsEKhN9C/Kxc1scel\n' +
            '2ykInDFP36zAxDZFjyqINBfUMkmAoWfbCVLL4MuhkB/ftrWLeTRPRgObioGcf/hMFYQSKWHJfnoG\n' +
            '1kk3j16amhdAdpk+LFwGFAZbUN9bWWNWnyAXF4kQQtVqcgUm2inMKJ20o1nDpR5ywasS0WSC2+D5\n' +
            'Xl5Zg/62ksfumlWN8hI7/37LxllegkZMkycHKI45FmrD56ssKs0H/cbXYl1ZN4UIx3YXPLkQv2Hr\n' +
            'SA5hJ1WLDaIt7mTIpGq+rMZvZRAklH09zNuRDtI34sesU4tqSEvBBtoyi5nabwo4u7ORnu1KDAWL\n' +
            'u31C/GvWlc/lnJE3GRISN6YmOpjkClYRlXQe62QEJTp4puCk63ghyPibxsBZvW7ocet4sCLvl9o1\n' +
            'i2xYRBLkchCdzhnF6VVPUXQnNqsCGOgjwFX2wtJWvNhUHDyHqk/2prNdSWGjC4EbyuoL5CQ/VOE5\n' +
            'v32PCHZ23kSo3j6mv59qA3nIdCx2uQUC5f8C7qa+remvnWyjfQiUjhg2X1kRg1+7RHF8KM8FxPqy\n' +
            '0ndm/aVG2h0sxNyTSVR1vaebzZRB0It/0jwTmZLX6CZ9GLeuILm83mbIFrVtJqStB8hidbN6vQOs\n' +
            'Hga5Pdm8XoGhTCOpdpaB3s/k3nQaDbXLtul3fTlnWrEY9xdwQndLMP3ZsSGDosB1/sVRAj/UpwsW\n' +
            'ixtCZiawr5HLlFERtlvfNV7N1dhZoaclHSUhmZKsoPmjhYthfB7Suh124jNymZbr10qwQZxD1JZG\n' +
            'C6nEAoGEc0HqCwRwInnWzD/I8TOHjAgfKNwJ51Dnz8MfCXlx146AVakbT1/t9o6N8rYXV2T6LYcm\n' +
            'FzOoUAenPyXkEnI4UvieumIFl9ZvPJJIZSHJ7j3Rme7Z2GNGErL/yid2Fz7s0kfs9NgdZZlrrS5I\n' +
            '+XY30qjHl0LDM5oxTNwIIXoPMMe+L0/NZsUktJS8Va0mp4fGlzsZBCmnaiZe7CabBEpiOSZNoCix\n' +
            'afBwtYUZrrFCWXT+c3NwvdwNpL4fL1+lyPhFF9cB8JH4/Fy6QpCndWJmrDBmrq7KgrMyjGRlZVwh\n' +
            'SD2Q261esx+pt0zOvUodNrNCpCJMilu0IWlzPbFkX9uo84J0VYimalIm4aPNYuEk6IgQc1AZWHeZ\n' +
            'EByYVTDJx+egwla524+7EYfvJXAz/8cwQzXgI27DZx5dds+NtTOsadQjsKItn2iD2eGYg5+sPtcc\n' +
            'PlzeZaoPXoZGSR6kZEHY7prlhsXBrj1ArpOprJSS8qzBIeZK6bZkNsS1XVHHqSKVRUdSx92VOEhW\n' +
            'ciHfzkK5iMVuK+OVBColbSTByOL+ZpdPVO42UN3fyILn4/uSH8PIsu6UIe8M7HHjbjU7R0XWam3u\n' +
            'GD/SUN+GFZKOkknkxLTiU0vYavDosohDU4nT0BHTUcor0oSk5+WOezBofOpxDW8XPd25acix/dyN\n' +
            'pjzrjksu3zn1xvbt+wVjn9gksQUcnlqDvIuMrHkOEKnnpTwe1fU5EbVIRoqTaIlkVGQhGdG6pqDY\n' +
            'rz2eBw+4Qaud06Ro6wY51fwdknkUCiH6p3VMDmMkRboVjIRCKk4UA1xQK3xTByVCEJR5mI1V12uY\n' +
            'kBA6JY8AFZghTXy6JPffQoDaedTpZcRlRUgzEDHPvrCVMNi95/8axLYWg50OwheH3ZqNxTNgZoUQ\n' +
            'Z7m5HC1wh2F5IlNJmUa2Ea4seuhBweh6coyhSbcvhM62lJQXpwjJGc91Mz2mo16fp0U9VWKen88E\n' +
            'kgVVUpsv6hNZqhtujYDUN5wCutvc6GLZlCND0YuzFFaNsgdL4xdVaiix9NW6k8bxraDgvmVHSzHo\n' +
            'B33vfgvtf+/khix8Z19rMuvhL82zXIhOOxepMvUPHgH4Bf/RMYOsBAdgaH9xSoFLdTNQN7KjVsLg\n' +
            'XOmpSL3F69obC3kyzCEcOB555VMGGwjgnKKhGNU7kWJwdIFAOl++34T4mJWELFpIvyoSRWwYyKPg\n' +
            '4YPUbHqFF8/1BFxRYkYlB0zXrWVwbCzBoHpU8BtqzYhA2fLcOk26/ngYUiqzPbxwW2K32iNVIn0m\n' +
            '7CZ3bhagctgd11LRG/dsIvRO+GYJszIq3jz5gK1Ww2gaY9MAw84705UIwTh650nbNLkh9w2i3j+C\n' +
            'iwRVSCzhM+9nq0R1JLU9Qk99PtspDpQdu4cqSn7MCe0sEsPDbNQUJUThaVD+cXRWF3ODDrKSdWfy\n' +
            'FSLJNrGVYTWRLB8yYncOcPqqBE5gPJGN7ki4FnnwMen6dgQC878nwJ2GwG4qaGyiobdu234oNXXj\n' +
            'sCV1/jIvdYBIrDFLE/hGkiN6qSZblDwd0hEmGYiYFQfNcJMdywdh8e+v0y3Pt/D8BwjkLlvj0Axf\n' +
            'jsNGma04NOJk3h4y4GSmFTSyjH0cDlBvHTtJnNug3bCF0mq01Db7ul1wjh8pztnc7uWHQglugFp+\n' +
            'HEwg/rppmOK+0ZdDzTYB1Tm4erHAUWvWJ0bskyPyxRmoeOqeDih2Xpddt7lt3m2FhfXzvY5DZCZM\n' +
            '3pqheIfy4qoZx7jo5zzk1g714Fe8oovEaxvoSuwE16dRI5FXv2MERXBxZLAVkteXk6Hn1cwaJFGl\n' +
            'YsBzaW2mDEVWg2Hbl92KWp4/zzTJx6xl7az8aGRBVVsRJfhODxoD160RNkvXEsMKsXuTrjWPThNj\n' +
            'z20CJMv/fHyBt5IQKBeqxftgyF48cjHqP4XyLR4kaybSU94aMbHN1Em/xhkaXd5Fi47kYyUWNy5D\n' +
            '/eu+naul9p5/gHW8iKoTzq6iBryX1zcBaJd0lHWa6ceUqWXpuTILjtknK0m1vXfJhi0eNrvTmh8Q\n' +
            'OdNryjGIfErxDtA58nx21TsZfmvov2/q78NI2HdW7tKeolsM7Lj25MwjA37dy8+Sq22FSKo8W0c+\n' +
            'EJ/EdYVwYberVAv96mqJNp5XeaVt89M4ZEnQlb5qGkAyNGblC3DUOHxDBssIFvTzOtyi+ibItVbc\n' +
            'UUoRAStni1Vc4s2X5ITG56cXNrI1qO4nxKhNyYWUMQDgTx3DPv4J139pPo/QITLr5MOEP37/Rj68\n' +
            'Z18A0aiLIvdtD+jX3oZNLK6nTfHCpuqi8cx3gybgl2xZtUm+FsT8XQx7N1g/bCxCzepruDXYQs3h\n' +
            'GHYzwMpf2C9zxWz1Amtzrz9DAofPDo0fbj/UaoUwPeLaAYTVtzxyJ2NAuWldQe1+ksmgbhywkHKc\n' +
            'E/Eg+g41zAxcljaet5+WF9J5PRzUWPsTvcu6oPlONg+W6K3dkQsY21GtCyINlJ5LIV8eMSbYJCdP\n' +
            'eOsJAlrOLWrkaZdmQJqk5dJJ2I+Bx3kxVSaYpNKaLNEU3Oc0SJNN4kN6s9VMSa/iZ7zagkSaPJML\n' +
            'JhZA7Djq1+3PfzbVjwQSV+/Kc/4/SLLxXJMHo8jj07tqK+uhJ7dm5HpK4K2b17fYpOJu3hDJ4bg+\n' +
            'Pp/O9JCaCI6SVvgsd7jIcFRLj0DH0QXRvTzdY83ZrkLiYBcoXsPvdNwemdlfrPCTtCYNtw7Pxd03\n' +
            'f/KH/XdOyT3WkUzk4XtkwbH5e4rvhzCts7ujVNW5kGy3IowaGbvh+WOLClciweBP2wjislFP4WrJ\n' +
            'sSNhaGow2X4IedBxptl1+50EIxOhY/vnxeLRHZEljndLiQd2ucLtcGCvVh87o1wr2pKTmI2K+in4\n' +
            '6dtEg0z6O4W7IbupffMpJSRcJnR/IvEizuJqQ4yCWZa5UvU0SfUugRy9IT1h4LXmQxVBJHkOuT3Z\n' +
            'xmQhXWnbGfrLsaD21iGIz+12OfeiEeeLAS9/7ehZHn3oI/vvQaRo0/TSTe8BFs37Qe23dswcQrLs\n' +
            'eil16G6vCWP//BxkXoZNJN3JMcBo+DM1T7OBKUceRCGKuYX+mi7qcLq5Z7/mnQu9QYNx6fF3Elxp\n' +
            'mKPk60LFLMganjNxWzhv6u4S4LPMyBPByr2yPpRnLMYDdyESwX6NjD5vlhNbgtQee24ylG0+7LdO\n' +
            '5LRbDOrRBW41q+fmuSU2qYQwmOk6S7w3n6vvsyX5z3SMUVN3/POf2+/0UsVkcuzl3ILb+eRMgOw5\n' +
            'FDAnWQfto1wnoTTkmu4JJhUPTjy2OrTDWDBK0ASoxb3rGfVEFDTWmTDbweFA+Mk5szAJMTWRLcmp\n' +
            '0Chu6+9KkPh+EswM4d9Xjp3yuwdUsIo86cjIu/fgP6DCzkClQioUbX46jYtw/LP/4Q+yjwyIPhP5\n' +
            'k7FxnZPX45b+X+36GTkcInkUg6m2K0XfhOeK4Yk/lJr76F59z/5AvIyHRARxzO+IfIqCiGEgwAWS\n' +
            'eT0HkptldNocCDJFZBerCNcFs80RdP6JqhW95N0SQ2maDCDdQNVTSxNeKGqNdpwAvV0xumqxcJXh\n' +
            '+yIPNRT3HEkgWb8M7rmxAIuXHR9Tfg3MuvFL32RJc9MxldpP1t27QWyxYvQn19DWoPVmLDwo/g8W\n' +
            'a+8cqqA1crjUu6dBJyHJ9EIpF0QzTN/vLebZvOKdu6ARk9ctFrYF+K9V0EvWdvZGbej/DeNdi/Vk\n' +
            'XB8OFw+c6iu302WYM+0Xkh5cakACBZcBGYUTKMuWNCIkzvktVnt0N3UczQToa000euSo9Yb29ZLT\n' +
            'YuK8eyRR9g+ad+FIwah0lfvwPnXvE1aLROsgED9+UUXeANPYHS3buwce1KVO/bi8zsbCxf9Ck5Vb\n' +
            'UNNrfvjmMheoB8spJIJJ1PMaTF12a+ddGpJx3YtWndORdfqV1y4zcweOxYcndaIwNMstFcicWo2f\n' +
            'U6Vn36BWoqSqHHDISDDrg9TngzfXCQsGluNzRnFomUAzaNy5FZHz6FaKAbCURCMdTVRrB/bz22bj\n' +
            'qA3fR6ysQJGHLKOJx54aXoO3AQh0e+cmzsJq2qrsaS999GwmlDrq8Hlr/9HlaXfABNdXyueLzXvv\n' +
            'F5eSmOEfICk0gknU0xpPC1C1PG95ofDQe+9s0f/QQnnzUZniw7TdkkYHarwDSPJycBs+tfcPFNVJ\n' +
            'bXYN++ehys0BGoTyAUjkCP1CERT9BEzlIdyYgg2WSajQw/EsnsDLLUeiA7Lx8jTh5L288Ej43gbE\n' +
            '92Z1rBwEMEyM2678BebF67BprLgSyvFx/NmYtNyz6D05n5tqll3vnmutIdOIZIV6dEIpF0UzS799\n' +
            'fx2uqr3nlpjhINRTH5uq+jjmJoWbkUZ9M0EieVLDIbYrbhYBXMGgBk9lcwjMtWc9kwrqUpDDYrqY\n' +
            'VbEbGb0pI+BarKHdMNMUidLbsG285M/a2ImCGHB+sC9aiqqUR1XSW2r16DAcNPwur3F2DFu+8iGg\n' +
            'rrDkfm/YMGnvmnx99+O4pjjAaJRCLpXIrQdCWY9ht3epyzaU/13jEDcutrDpRfumXtKmTn5iEYrB\n' +
            'eZlBmZ3KBWFcMdGmJ6PIkBemrD8AZrSs1v/JfVmUEs0cioaxi7zkMf6L+q2lrsrihDZXUl4ok4Aj\n' +
            'VVKNu0FW//4x/YvmqVoarOhb0GDvj63KVlc5dt26ajCyAtPolEIunGnDr1B4+seOWJvvFg9U+e+/\n' +
            'NvccMd94j+e9UVFWArcOKkSUIITbQ9j4RFz6AAYDAcQk1djbDyeMhCQo9h5+rVWPX+B9i2dh3ndB\n' +
            'o2m/3jjN6Dfv3K4i0LsbEKXQnpS5dIJJ1NMWSMr1158cUXtVnFP/iergd/qxhmrsudgXOvuBzenj\n' +
            '0xdMRJ5PrMQ5+BA+F0u0iSmhZAJRmzE5YeCaieoEmneGAkREJXh0g8jGg0gQj9vXvLFqwt+QgHSn\n' +
            'chUFVjaKpSrquO93vn9njUdfKl65966qk4uiDyApNIJJ1NMaTwdQi3Xjgy98CefbepemR6PKEP83\n' +
            'q9Tmd2JvoWDsboiafDk5OFAcNGwp3phcPhgtPhgGLjiJciRC5OAqcnEojGYuS21BGLc0faOBIkfr\n' +
            'FYHLH6emxaugRrP12C2v0HkIiFE4qhlsFmW+S0O54qGDV2zRNzSwLo4sgLTCKRdDbFkMLXoRQXF6\n' +
            'ufv/n3k/S6wHlkwJ0aiycGKIqZp6hKH93Qe9o0zc7ti2yaDaqThzdkIrtHLrw+H2wuFzSnAyrFB/\n' +
            'V4ArFAAJX79qGirAzBmlpDgbpX1RS/3e78UNWcbw32Dl47Y8mSMLoR8gKTSCSdTTGk8B0Tbr/9Kk\n' +
            '90m7/PwYO7RyMe66eb6KUa2sC4Ec0lJcymj74nWX5e0wR5LbUYCVxd3EgcVHV9R1y1rXO5MtZPPP\n' +
            '3qZcVPPdW5nWMlEomkm1OMQ+mER5okkg4l7e4MEolE0k6UtHKeRCKRSCTdloX4qqVXjfZrpCuRHB\n' +
            'U5gF0ikRwLnoEVy+N2Qlxgktsi3UzTZkgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJRC\n' +
            'KRSCQSiUQikUgkEolEIpFIJBKJRCKRSCQSiUQikUgkEolEIpFIJBKJpFP4/zxz1fL2AxvoAAAAAE\n' +
            'lFTkSuQmCC',
          width: this.paymentMethod.invoice ? 100 : 400,
          alignment: this.paymentMethod.invoice ? 'left' : 'center'
        },
        this.paymentMethod.invoice ? {
          columns: [
            [
              { text: `Date - ${new Date(Date.now()).toLocaleDateString()}`, width: '*', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {
                text: this.paymentMethod.invoice ? `INVOICE NO:  #${this.receiptNumber}` : `Receipt Number #${this.receiptNumber}`,
                style: 'textRegular',
                alignment: this.paymentMethod.invoice ? 'left' : 'center'
              },
              {text: 'Pourtap Limited', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'P.O. Box 3305-90100 MACHAKOS, KENYA', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'}
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
            [
              {text: 'Pourtap Limited', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'P.O. BOX 6782 - 00200, KENYA', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'TE: 0712694934 | 0722794988', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'},
              {text: 'PIN: P051820673J', style: 'textRegular', alignment: this.paymentMethod.invoice ? 'left' : 'center'}
            ]

          ]
        },
        this.paymentMethod.invoice != true ? {
          columns: [
            [
              {text: `CASH SALE #${this.receiptNumber}`, style: 'textRegular', alignment: 'left'},
              {text: `DATE TIME: ${new Date(Date.now()).toLocaleDateString()}`, style: 'textRegular', alignment: 'left'},
              {text: `SHOP NAME: ${this.data.shopName.toUpperCase()}`, style: 'textRegular', alignment: 'left'}
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
          table: {
            headerRows: this.paymentMethod.invoice ? 1 : 0,
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
                  {text: p.sellingPrice, style: 'textRegular', margin: this.paymentMethod.invoice ? [0,5,0,5] : [0, 10, 0, 10]},
                  {text: (p.quantity * p.sellingPrice).toFixed(2), style: 'textRegular', margin: this.paymentMethod.invoice ? [0,5,0,5] : [0, 10, 0, 10]}
                ]))),
            ]
          },
          layout: 'headerLineOnly',
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
                  text: 'TAX: ', style: 'textRegularLarge', bold: true, colspan: 6, margin: this.paymentMethod.invoice ? 0 : [0 , 35, 0, 35]
                }
              ],
              [
                {
                  text: `${this.taxTotal}`,
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
                  text: `${this.cartTotal}`,
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
        this.paymentMethod.invoice != true ? {
          text: 'THANK YOU FOR CHOOSING US TO SERVE YOU\nWE APPRECIATE AND VALUE YOUR FEEDBACK\nENJOY OUR PRODUCTS AND WELCOME AGAIN',
          bold: true,
          style: 'textRegularLarge',
          margin: [0, 35, 0, 35]
        } : {},
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
          margin: [0,5,0,5]
        }
      }
    };
    pdfMake.createPdf(documentDefinition).print({silent: true}); // print the table data
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
