export interface Itemmaster {
  id: number;
  categoryId: number;
  itemBarCode: string;
  itemCode: string;
  itemName: string;
  description?: string;
  uom: string;
  rate?: number;
  minimumStock: number;
  maximumStock: number;
  isActive: boolean;
}
