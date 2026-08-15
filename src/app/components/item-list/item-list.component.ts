import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ItemmasterService } from '../../services/itemmaster.service';
import { Itemmaster } from '../../models/itemmaster';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ItemFormComponent } from '../item-form/item-form.component';
import { PagedResult } from '../../models/paged-result';
import { ItemmasterFilter } from '../../models/ItemmasterFilter';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { MatSelectModule } from '@angular/material/select';
import { ApiResponse } from '../../models/api-response';
@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  items = signal<Itemmaster[]>([]);
  dataSource!: MatTableDataSource<Itemmaster>;
  categories: Category[] = [];

  displayedColumns: string[] = [
    'catName',
    'itemBarCode',
    'itemCode',
    'itemName',
    'description',
    'uom',
    'rate',
    'minimumStock',
    'maximumStock',
    'isActive',
    'actions',
  ];

  isLoading = false;

  filterForm!: FormGroup;
  pageSize = 10;
  pageIndex = 0;
  totalRecords = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: ItemmasterService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadCategories();
    this.loadItems();
  }

  // ---------------- FILTER FORM ----------------
  initFilterForm() {
    this.filterForm = this.fb.group({
      categoryId: [null],
      itemBarCode: [''],
      itemCode: [''],
      itemName: [''],
      uom: [''],
      isActive: [null],
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
        this.pageIndex = 0;
        this.loadItems();
      });
  }
  clearFilters() {
    this.filterForm.reset({
      categoryId: null,
      itemBarCode: '',
      itemCode: '',
      itemName: '',
      uom: '',
      isActive: null,
    });

    this.pageIndex = 0;
    this.loadItems();
  }
  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadItems();
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
      this.snackBar.open('Category loading error', 'Close', { duration: 3000 });
    }
  }
  // ---------------- LOAD ITEMS ----------------
  async loadItems() {
    this.isLoading = true;

    try {
      const filter: ItemmasterFilter = {
        categoryId: this.filterForm.value.categoryId,
        itemBarCode: this.filterForm.value.itemBarCode,
        itemCode: this.filterForm.value.itemCode,
        itemName: this.filterForm.value.itemName,
        uom: this.filterForm.value.uom,
        isActive: this.filterForm.value.isActive,
        pageNumber: this.pageIndex + 1,
        pageSize: this.pageSize,
      };

      const response: ApiResponse<PagedResult<Itemmaster>> =
        await firstValueFrom(this.service.getPagedItems(filter));
      if (!response.success) {
        this.snackBar.open(
          response.message || 'Unable to load items',
          'Close',
          { duration: 3000 },
        );

        return;
      }
      const pagedResult = response.data;
      this.items.set(pagedResult.data ?? []);
      this.totalRecords = pagedResult.totalRecords;
      this.dataSource = new MatTableDataSource(pagedResult.data ?? []);
      setTimeout(() => {
        this.dataSource.sort = this.sort;
      });
    } catch {
      this.snackBar.open('Item Loading Error', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  getCategoryName(categoryId: number | null | undefined): string {
    if (!categoryId) {
      return '';
    }

    const category = this.categories.find((c) => c.id === categoryId);

    return category?.name ?? '';
  }
  // ---------------- DELETE ----------------
  async delete(id: number, name: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { name },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (!result) return;

    try {
      await firstValueFrom(this.service.delete(id));

      this.snackBar.open('Item deleted successfully', 'Close', {
        duration: 3000,
      });

      await this.loadItems();
      this.clearFilters();
    } catch {
      this.snackBar.open('Item delete error', 'Close', { duration: 3000 });
    }
  }

  // ---------------- DIALOGS ----------------
  openAddDialog() {
    const dialogRef = this.dialog.open(ItemFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog',
      autoFocus: false,
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Item created successfully', 'Close', {
          duration: 3000,
        });
        this.loadItems();
      }
    });
  }

  openEditDialog(item: any) {
    const dialogRef = this.dialog.open(ItemFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog',
      autoFocus: false,
      data: item,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.snackBar.open('Item updated successfully', 'Close', {
          duration: 3000,
        });
        this.loadItems();
      }
    });
  }
}
