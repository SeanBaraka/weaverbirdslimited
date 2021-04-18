import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {VehicleService} from "../../services/vehicle.service";

@Component({
  selector: 'app-vehicle-routes',
  templateUrl: './vehicle-routes.component.html',
  styleUrls: ['./vehicle-routes.component.sass']
})
export class VehicleRoutesComponent implements OnInit {
  vehicleRoutes: any[] = [];
  vehicleRouteForm =  this.fb.group({
    name: ['', Validators.required],
    region: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private vehicleService: VehicleService) { }

  ngOnInit(): void {
    this.getRoutes();
  }

  getRoutes(): void {
    this.vehicleService.getVehicleRoutes().subscribe((response) => {
      this.vehicleRoutes = response;
    });
  }

  addRoute(): void {
    this.vehicleService.addVehicleRoute(this.vehicleRouteForm.value).subscribe((response ) => {
      if (response) {
        this.getRoutes();
        this.vehicleRouteForm.reset();
      }
    });
  }
}
