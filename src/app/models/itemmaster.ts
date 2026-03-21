export interface Itemmaster {
    id:number;
    catCode:string;
    itemBarCode:string;
    itemCode:string;
    itemName:string;
    description?:string;
    uom:string;
    rate?:number;
    minimumStock:number;
    maximumStock:number;
    isActive:boolean;
}