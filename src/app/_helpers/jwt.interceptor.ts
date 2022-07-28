// import {Injectable} from "@angular/core";
// import {HttpHandler, HttpInterceptor, HttpRequest, HttpEvent} from "@angular/common/http";
// import {Observable} from "rxjs";
// import {AccountService} from "../_services";
//
//
// @Injectable()
// export class JwtInterceptor implements HttpInterceptor{
//
//
//   constructor(private accountServive: AccountService) {
//
//   }
//
//
//
//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const user= this.accountServive.userValue;
//     const isLoggedIn= user && user.token
//     // const isApiUrl= request.url.startsWith()
//     if(isLoggedIn){
//       request= request.clone({
//         setHeaders: {
//           Authorization: 'Bearer '+ user.token
//         }
//       })
//     }
//     return next.handle(request)
//   }
// }
