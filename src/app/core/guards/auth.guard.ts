import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { User } from 'firebase/auth';
import { map, Observable,pipe ,ReplaySubject,take,tap } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  _token :any;

  constructor(private token : TokenStorageService, private router: Router,private auth:AngularFireAuth,private userService:UserService){
    this.auth.onAuthStateChanged((user:User|any)=>{
      if(user){
        this.userService.currentUser$.next(user);
      }else{
        //no user login.
      }
    })
  }

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
