import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //API = "https://moneysense-app-default-rtdb.firebaseio.com/";
  API = environment.API;
  //API = "https://ppm-db-default-rtdb.firebaseio.com/";

  

  constructor(private http: HttpClient) {}

  public get(url: string, options?: any) {
    return this.http.get(`${this.API}${url}.json`, options);
    //return this.http.get(`${this.API}posts.json`, options);
  }

  public post(url: string, data: any, options?: any) {
    return this.http.post(`${this.API}${url}.json`, data, options);
  }

  public put(url: string, data: any, options?: any) {
    return this.http.put(`${this.API}${url}.json`, data, options);
  }

  public delete(url: string, options?: any) {
    return this.http.delete(`${this.API}${url}.json`, options);
  }

  /* Common Service */
  public convertDBData_ObjToArray(data:any){
    if(!data){
      return [];
    }
   return Object.entries(data).map((obj:any)=>{
      obj[1].id = obj[0];
      return obj[1];
    });
  }
}
