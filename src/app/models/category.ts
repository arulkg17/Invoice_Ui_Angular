export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}