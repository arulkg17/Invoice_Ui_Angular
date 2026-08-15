export interface ItemmasterFilter {
  categoryId?: number | null;
  itemBarCode?: string;
  itemCode?: string;
  itemName?: string;
  uom?: string;
  isActive?: boolean | null;
  pageNumber: number;
  pageSize: number;
}