import { Injectable } from "@angular/core";
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor( private authService : AuthService){}

    intercept(
        req: HttpRequest<any>, 
        next: HttpHandler):
        Observable<HttpEvent<any>> {
        if(req.url.includes('/login/login')) return next.handle(req);
        const token = this.authService.getToken();
        if(token){
            const cloneReq = req.clone({
                setHeaders: {
                    Authorization : `Bearer ${token}`
                }
            });
            return next.handle(cloneReq);
        }
        return next.handle(req);
    }
}
