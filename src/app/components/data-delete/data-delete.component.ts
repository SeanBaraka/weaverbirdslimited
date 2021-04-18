import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {StockDataService} from "../../services/stock-data.service";

@Component({
  selector: 'app-data-delete',
  templateUrl: './data-delete.component.html',
  styleUrls: ['./data-delete.component.sass']
})
export class DataDeleteComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private stockService: StockDataService,
    private dialogRef: MatDialogRef<DataDeleteComponent>
  ) { }

  ngOnInit(): void {
  }

  confirmDelete(deleteData: any): void {
    const id = deleteData.itemId;
    const item = deleteData.item;

    switch (item) {
      case 'product': {
        this.stockService.removeFromShop(id, this.data.shopId).subscribe((response) => {
          if (response) {
            this.dialogRef.close('true');
          }
        });
      }
    }
  }
}
