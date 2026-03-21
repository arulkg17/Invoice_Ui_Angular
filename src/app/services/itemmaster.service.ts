import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Itemmaster } from "../models/itemmaster"; 
import { Signal } from "@angular/core";
import { ItemRequest } from "../models/itemrequest";

@Injectable({
  providedIn:'root'
})
export class ItemmasterService {
  private apiUrl = "http://localhost:5269/api/Itemmaster";
  
  items = signal<Itemmaster[]>([]);

  constructor(private http:HttpClient){}

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