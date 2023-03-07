import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  API = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  public get(url: string, options?: any) {
    return this.http.get(`${this.API}${url}`, options);
  }

  public post(url: string, data: any, options?: any) {
    return this.http.post(`${this.API}${url}`, data, options);
  }

  public put(url: string, data: any, options?: any) {
    return this.http.put(`${this.API}${url}`, data, options);
  }

  public delete(url: string, options?: any) {
    return this.http.delete(`${this.API}${url}`, options);
  }
}
