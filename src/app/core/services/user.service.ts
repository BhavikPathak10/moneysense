import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  public currentUser$: ReplaySubject<User> = new ReplaySubject<User>(1);
  
  constructor() { }
  }
