import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {SupplierService} from '../../services/supplier.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

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
    private dialogRef: MatDialogRef<AddSupplierComponent>,
    @Inject(MAT_DIALOG_DATA)private supplierInfo?: any
  ) { }

  ngOnInit(): void {
    if (this.supplierInfo !== null) {
      this.supplierForm.get('name').setValue(this.supplierInfo.name);
      this.supplierForm.get('telephone').setValue(this.supplierInfo.telephone);
      this.supplierForm.get('email').setValue(this.supplierInfo.email);
    }
  }

  addSupplier(): void {
    // for supplier updates
    if (this.supplierInfo !== null) {
      const supplierId = this.supplierInfo.id;
      this.supplierService.addSupplier(this.supplierForm.value, supplierId).subscribe((response) => {
        if (response){
          this.successMessage = response.success;
          this.dialogRef.close('true');
        }
      });
    } else {
      this.supplierService.addSupplier(this.supplierForm.value, -1).subscribe((response) => {
        if (response){
          this.successMessage = response.success;
          this.dialogRef.close('true');
        }
      });
    }
  }
}
