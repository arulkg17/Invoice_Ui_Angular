import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ItemmasterService } from "../../services/itemmaster.service";
import { Itemmaster } from "../../models/itemmaster";
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../shared/confirm-dialog/confirm-dialog.component";
import { ItemFormComponent } from "../item-form/item-form.component";

@Component({
    selector:'app-item-list',
    standalone:true,
    imports:[CommonModule,
        RouterModule,
        MatTableModule,
        MatButtonModule,
        MatDialogModule],
    templateUrl:'./item-list.component.html',
    styleUrls:['./item-list.component.css']
})
export class ItemListComponent implements OnInit {
    items = signal<Itemmaster[]>([]);
        // Add a MatTableDataSource to connect with mat-table
    dataSource!: MatTableDataSource<Itemmaster>;
    displayedColumns:string[] = 
            [
                'catCode','itemBarCode', 'itemCode','itemName',
                'description','uom','rate','minimumStock','maximumStock',
                'isActive','actions'
            ];
    constructor(
        private service:ItemmasterService,
        private snackBar:MatSnackBar,
        private dialog:MatDialog
    ){}
    ngOnInit(): void {
        this.loadItems();
    }

    loadItems(){
        return this.service.getAll().subscribe({
            next: (res:any) =>{ 
                this.items.set(res.data);
                this.dataSource = new MatTableDataSource(res.data);
            },
           error:()=>{
               this.snackBar.open(
                'Item Loading Error',
                'Close',
                {duration:3000});
           }
        });
    }
    delete(id:number, name:string){
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '350px',
                data: { name }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(!result) return;
            this.service.delete(id).subscribe({
                next: () =>{
                    //this.items.update(list=>list.filter(i=>i.id !== id));
                    //this.dataSource.data = this.items();
                    this.loadItems();
                    this.snackBar.open('Item delete successfully','Close',
                        {duration:3000}
                    );
                },
                error: () =>{
                    this.snackBar.open('Item delete error', 'Close',
                        {duration:3000});
                }
            });
        });
    } 
    openAddDialog(){
        const dialogRef = this.dialog.open(ItemFormComponent, {
            width:'700px',
            maxHeight:'80vh',
            panelClass:'custom-dialog',
            data:null
        });
        dialogRef.afterClosed().subscribe(result=>{
            if(result) this.loadItems();
        });
    }
    openEditDialog(item:any){
        const dialogRef = this.dialog.open(ItemFormComponent, {
            width:'700px',
            data:item
        });
        dialogRef.afterClosed().subscribe(result=>{
            if(result) this.loadItems();
        });
    }
}
