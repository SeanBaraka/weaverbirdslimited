import { Component, OnInit } from '@angular/core';
import {VehicleService} from "../../services/vehicle.service";
import {FormBuilder, Validators} from "@angular/forms";
import {PersonnelStaffService} from "../../services/personnel-staff.service";

@Component({
  selector: 'app-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.sass']
})
export class PersonnelComponent implements OnInit {
  personnel: any[] = [];

  constructor(private vehicleService: VehicleService,
              private personnelService: PersonnelStaffService,
              private fb: FormBuilder) { }

  personnelForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    idNumber: ['', Validators.required],
    role: ['', Validators.required]
  });

  ngOnInit(): void {
    this.getPersonnel();
  }

  getPersonnel(): void {
    this.personnelService.getPersonnel().subscribe((response) => {
      if (response) {
        this.personnel = response;
      }
    });
  }
  addPersonnel(): void {
    this.personnelService.addPersonnel(this.personnelForm.value).subscribe((response) => {
      if (response) {
        this.getPersonnel();
        this.personnelForm.reset()
      }
    })
  }
}
