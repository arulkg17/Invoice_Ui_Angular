import { Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Itemmaster } from "../models/itemmaster"; 
import { PagedResult } from "../models/paged-result";

@Injectable({
  providedIn:'root'
})
export class ItemmasterService {
  private apiUrl = "http://localhost:5269/api/v1/Itemmaster";
  
  items = signal<Itemmaster[]>([]);

  constructor(private http:HttpClient){}
 getPagedItems(
    catCode: string,
    itemName: string,
    uom: string,
    pageNumber: number,
    pageSize: number
  ): Observable<PagedResult<Itemmaster>> {

    let params = new HttpParams()
      .set('catCode', catCode || '')
      .set('itemName', itemName || '')
      .set('uom', uom || '')
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Itemmaster>>(
      `${this.apiUrl}/GetAllPaged`,
      { params }
    );
  }
  getAll():Observable<Itemmaster[]>{
    return this.http.get<Itemmaster[]>(`${this.apiUrl}/GetAll`);
  }
  getById(id:number):Observable<Itemmaster>{
    return this.http.get<Itemmaster>(`${this.apiUrl}/GetById/${id}`);
  }
  create(request:Itemmaster):Observable<number>{
    return this.http.post<number>(`${this.apiUrl}/Create`, request);
  }
  update(id:number, request:Itemmaster): Observable<boolean>{
    return this.http.put<boolean>(`${this.apiUrl}/update/${id}`, request); 
   }
   delete(id:number):Observable<boolean>{
    return this.http.delete<boolean>(`${this.apiUrl}/delete/${id}`);
   }
}