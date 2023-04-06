import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable,pipe ,take,tap } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  user:any;
  _token :any;

  constructor(private token : TokenStorageService, private router: Router,private auth:AngularFireAuth){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.auth.authState
          .pipe(
            take(1),
            map(user => !!user),
            tap(
              loggedIn => {
                let _token = this.token.getToken();
                if (!loggedIn && !_token) {
                  this.router.navigate(['auth']);
                }
              }
            )
          );
    }
  
}
