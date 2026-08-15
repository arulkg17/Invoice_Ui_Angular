import { ApiError } from './api-error';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: ApiError | null;
  timestamp: string;
  totalRecords: number;
}
