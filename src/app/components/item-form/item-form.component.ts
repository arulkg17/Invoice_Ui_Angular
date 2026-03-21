import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ItemmasterService } from '../../services/itemmaster.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { ItemRequest } from '../../models/itemrequest';
import { Itemmaster } from '../../models/itemmaster';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule
  ],
  templateUrl: './item-form.component.html'
})
export class ItemFormComponent implements OnInit {

  form!:FormGroup;
  
  isEdit = false;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private service: ItemmasterService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      catCode: [''],
      itemBarCode:[''],
      itemCode: [''],
      itemName: [''],
      description:[''],
      uom:[''],
      rate:[0],
      minimumStock:[0],
      maximumStock:[0],
      isActive:[true]
    });

    this.id = this.route.snapshot.params['id'];

    if (this.id) {
      this.isEdit = true;

      this.service.getById(this.id).subscribe({
        next: (res:any) => {
          this.form.patchValue(res.data);
        },
        error: () => {
          this.snackBar.open('Error loading item', 'Close', { duration: 3000 });
        }
      });
    }
  }

  submit() {
    if(this.form.invalid) return;
    const formValue = this.form.value;
    const payload: Itemmaster = {
        ...formValue,
        rate: Number(formValue.rate),
        minimumStock: Number(formValue.minimumStock),
        maximumStock: Number(formValue.maximumStock),
        isActive: formValue.isActive === true
    };

    if (this.isEdit) {
      this.service.update(this.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Item updated successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/items']);
        },
        error: () => {
          this.snackBar.open('Error updating item', 'Close', {
            duration: 3000
          });
        }
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Item created successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/items']);
        },
        error: () => {
          this.snackBar.open('Error creating item', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }
}