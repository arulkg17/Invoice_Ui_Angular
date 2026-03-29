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
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent implements OnInit {
  items = signal<Itemmaster[]>([]);
  dataSource!: MatTableDataSource<Itemmaster>;

  displayedColumns: string[] = [
    'catCode',
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.loadItems();
  }

  // ---------------- FILTER FORM ----------------
  initFilterForm() {
    this.filterForm = this.fb.group({
      catCode: [''],
      itemName: [''],
      uom: [''],
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((value) => {
         this.pageIndex=0;
         this.loadItems();
      });
  }
  clearFilters() {
    this.filterForm.reset({
      catCode: '',
      itemName: '',
      uom: ''
    });

    this.pageIndex = 0;
    this.loadItems();
  }
  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadItems();
  }

  // ---------------- LOAD ITEMS ----------------
  async loadItems() {
    this.isLoading = true;

    try {
      const filter = this.filterForm.value || {};

      const res: PagedResult<Itemmaster> = await firstValueFrom(
        this.service.getPagedItems(
          filter.catCode,
          filter.itemName,
          filter.uom,
          this.pageIndex + 1, // API usually 1-based
          this.pageSize,
        ),
      );
      
      this.items.set(res?.data ?? []);
      this.totalRecords = res.totalRecords;
      this.dataSource = new MatTableDataSource(res?.data ?? []);

      setTimeout(() => {
        this.dataSource.sort = this.sort;
      });
    } catch {
      this.snackBar.open('Item Loading Error', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
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
      if (result) 
      {
          this.snackBar.open('Item created successfully', 'Close', {
            duration: 3000
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
      if (result === true) 
      {
         this.snackBar.open('Item updated successfully', 'Close', {
            duration: 3000
          });
        this.loadItems();
      }
    });
  }
}
