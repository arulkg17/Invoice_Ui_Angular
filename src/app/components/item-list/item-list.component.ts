import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemmasterService } from '../../services/itemmaster.service';
import { Itemmaster } from '../../models/itemmaster';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ItemFormComponent } from '../item-form/item-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { JsonpClientBackend } from '@angular/common/http';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  @ViewChild('catCodeInput') catCodeInput : any;
  @ViewChild('itemNameInput') itemNameInput : any;
  @ViewChild('uomInput') uomInput : any;

  constructor(
    private service: ItemmasterService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems() {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (res: any) => {
        this.items.set(res.data);
        this.dataSource = new MatTableDataSource(res.data);

        // Assign paginator & sort
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

        // Global filter across all columns
        this.dataSource.filterPredicate = (
          data: Itemmaster,
          filter: string,
        ): boolean => {
          const searchText = JSON.parse(filter);

          return (
            (!searchText.itemName ||
              (data.itemName ?? '')
                .toLowerCase()
                .includes(searchText.itemName)) &&
            (!searchText.catCode ||
              (data.catCode ?? '')
                .toLowerCase()
                .includes(searchText.catCode)) &&
            (!searchText.uom ||
              (data.uom ?? '').toLowerCase().includes(searchText.uom))
          );
        };

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Item Loading Error', 'Close', { duration: 3000 });
      },
    });
    this.clearFilters();
   
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  delete(id: number, name: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { name },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Item deleted successfully', 'Close', {
            duration: 3000,
          });
          this.loadItems();
        },
        error: () => {
          this.snackBar.open('Item delete error', 'Close', { duration: 3000 });
        },
      });
    });
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(ItemFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog',
      autoFocus: false,
      data: null,
    });
    dialogRef.afterClosed().subscribe((result) => {
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
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadItems();
    });
  }

  filterValues: any = {
    catCode: '',
    itemName: '',
    uom: '',
  };

  applyColumnFilter(column: string, event: Event) {
    const value = (event.target as HTMLInputElement).value;

  this.filterValues[column] = value.trim().toLowerCase();

  // trigger filter properly WITHOUT breaking JSON
  this.dataSource.filter = JSON.stringify({ ...this.filterValues });
  }

  clearFilters() {
    this.filterValues = {
      catCode: '',
      itemName: '',
      uom: '',
    };
    if(this.catCodeInput) this.catCodeInput.nativeElement.value = '';
    if(this.itemNameInput) this.itemNameInput.nativeElement.value = '';
    if(this.uomInput) this.uomInput.nativeElement.value = '';

    this.dataSource.filter = JSON.stringify({ ...this.filterValues });
  }
}
