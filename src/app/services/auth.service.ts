import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { LoginRequest } from "../models/loginrequest";
import { LoginResponse } from "../models/loginresponse";
import { Observable } from "rxjs";

@Injectable({
    providedIn:'root'
})
export class AuthService{
    private TOKEN_KEY = 'token';
    private EXP_KEY = 'token_exp';
    private tokenUrl = "http://localhost:5269/api/v1/Login/login";

    constructor(private http: HttpClient){}
    
    login(credentials:LoginRequest):Observable<LoginResponse>{
        return this.http.post<LoginResponse>(this.tokenUrl, 
           credentials);
    }
    
    // Save token
    setSession(token:string, expiration:string){
        
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.EXP_KEY, expiration);
    }
    // Get token
    getToken():string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    // Check token expired
    isTokenExpired():boolean {
        const exp = localStorage.getItem(this.EXP_KEY);
        if(!exp) return true;
        return new Date(exp) < new Date();
    }
    // Logout
    logout(){
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.EXP_KEY);
    }
    isLoggedIn(): boolean {
         return !!localStorage.getItem('token');
    }

}