import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ItemmasterService } from '../../services/itemmaster.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
} from '@angular/material/dialog';
import { Itemmaster } from '../../models/itemmaster';
import { SelectOnFocusDirective } from '../../custom-directives/select-on-focus.directive';
import { firstValueFrom } from 'rxjs';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    SelectOnFocusDirective,
    MatDialogContent,
  ],
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css'],
})
export class ItemFormComponent implements OnInit {
  form!: FormGroup;

  isEdit = false;
  id!: number;
  uomLists: string[] = ['KGS', 'NOS', 'LTR', 'DOZ'];
  isSubmitted = false;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ItemmasterService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ItemFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  get f() {
    return this.form.controls;
  }

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      categoryId: [null, Validators.required],

      itemBarCode: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(25),
        ],
      ],

      itemCode: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(10),
        ],
      ],

      itemName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],

      description: ['', Validators.maxLength(250)],
      uom: ['', Validators.required],
      rate: [0],
      minimumStock: [0],
      maximumStock: [0],
      isActive: [true],
    });

    await this.loadCategories();

    if (this.data) {
      this.isEdit = true;
      this.id = this.data.id;
      this.form.patchValue(this.data);
    }
  }
  async loadCategories(): Promise<void> {
    try {
      const response: ApiResponse<Category[]> = await firstValueFrom(
        this.categoryService.getAll(),
      );

      if (!response.success) {
        this.snackBar.open(
          response.message || 'Unable to load categories',
          'Close',
          { duration: 3000 },
        );
        return;
      }

      this.categories = response.data ?? [];
    } catch {
      this.snackBar.open('Category loading error', 'Close', {
        duration: 3000,
      });
    }
  }
  submit() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formValue = this.form.value;
    const payload: Itemmaster = {
      ...formValue,
      rate: Number(formValue.rate),
      minimumStock: Number(formValue.minimumStock),
      maximumStock: Number(formValue.maximumStock),
      isActive: formValue.isActive === true,
    };

    if (this.isEdit) {
      this.service.update(this.id, payload).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error updating item', 'Close', {
            duration: 3000,
          });
        },
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error creating item', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.key;

    if (!/^[0-9]$/.test(charCode)) {
      event.preventDefault();
    }
  }
}
