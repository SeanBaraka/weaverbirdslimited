import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {SupplierService} from '../../services/supplier.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.sass']
})
export class AddSupplierComponent implements OnInit {
  successMessage: any;
  supplierForm = this.fb.group({
    name: ['', Validators.required],
    telephone: ['', Validators.required],
    email: ['']
  });

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private dialogRef: MatDialogRef<AddSupplierComponent>
  ) { }

  ngOnInit(): void {
  }

  addSupplier(): void {
    this.supplierService.addSupplier(this.supplierForm.value).subscribe((response) => {
      if(response){
        this.successMessage = response.success;
        this.dialogRef.close('true');
      }
    });
  }
}
