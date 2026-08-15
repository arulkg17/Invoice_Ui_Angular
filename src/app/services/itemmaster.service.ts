import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Itemmaster } from '../models/itemmaster';
import { ItemmasterFilter } from '../models/ItemmasterFilter';
import { PagedResult } from '../models/paged-result';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class ItemmasterService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/v1/Itemmaster`;

  getPagedItems(filter: ItemmasterFilter): Observable<ApiResponse<PagedResult<Itemmaster>>> {
    const params = new HttpParams()
      .set('categoryId', filter.categoryId ?? '')
      .set('itemBarCode', filter.itemBarCode ?? '')
      .set('itemCode', filter.itemCode ?? '')
      .set('itemName', filter.itemName ?? '')
      .set('uom', filter.uom ?? '')
      .set('isActive', filter.isActive ?? '')
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize);

    return this.http.get<ApiResponse<PagedResult<Itemmaster>>>(
      `${this.apiUrl}/GetAllPaged`,
      { params },
    );
  }

  getAll(): Observable<Itemmaster[]> {
    return this.http.get<Itemmaster[]>(`${this.apiUrl}/GetAll`);
  }

  getById(id: number): Observable<Itemmaster> {
    return this.http.get<Itemmaster>(`${this.apiUrl}/GetById/${id}`);
  }

  create(request: Itemmaster): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/Create`, request);
  }

  update(id: number, request: Itemmaster): Observable<boolean> {
    return this.http.put<boolean>(`${this.apiUrl}/Update/${id}`, request);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Delete/${id}`);
  }
}
