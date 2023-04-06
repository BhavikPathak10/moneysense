import { Injectable } from '@angular/core';
const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {


  constructor() { }

  signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.clear();
    sessionStorage.clear();
  }

  public saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

}
