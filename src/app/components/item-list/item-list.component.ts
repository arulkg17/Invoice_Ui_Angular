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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private service: ItemmasterService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
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
      uom: ['']
    });

    this.filterForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.applyFilter(value);
      });
  }

  applyFilter(filter: any) {
    if (!this.dataSource) return;

    this.dataSource.filterPredicate = (data: Itemmaster) => {
      return (
        (!filter.catCode || data.catCode?.toLowerCase().includes(filter.catCode.toLowerCase())) &&
        (!filter.itemName || data.itemName?.toLowerCase().includes(filter.itemName.toLowerCase())) &&
        (!filter.uom || data.uom?.toLowerCase().includes(filter.uom.toLowerCase()))
      );
    };

    this.dataSource.filter = JSON.stringify(filter);
  }

  clearFilters() {
    this.filterForm.reset({
      catCode: '',
      itemName: '',
      uom: ''
    });

    this.applyFilter(this.filterForm.value);
  }

  // ---------------- LOAD ITEMS ----------------
  async loadItems() {
    this.isLoading = true;

    try {
      const res: any = await firstValueFrom(this.service.getAll());

      this.items.set(res.data);
      this.dataSource = new MatTableDataSource(res.data);

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

      this.applyFilter(this.filterForm?.value || {});
    }
    catch {
      this.snackBar.open('Item Loading Error', 'Close', { duration: 3000 });
    }
    finally {
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
    }
    catch {
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadItems();
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

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadItems();
    });
  }
}