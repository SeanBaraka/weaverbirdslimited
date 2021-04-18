import { Component, OnInit } from '@angular/core';
import {StockDataService} from "../../services/stock-data.service";
import {VehicleService} from "../../services/vehicle.service";
import {Router} from "@angular/router";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }

}
