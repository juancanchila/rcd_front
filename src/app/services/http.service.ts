import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getToken(): string {
    // Alternativa si prefieres localStorage:
    // return localStorage.getItem('token') || '';
    return this.cookieService.get('token');
  }

  private getHeaders(extra: Record<string, string> = {}): HttpHeaders {
    const token = this.getToken();
    const baseHeaders: Record<string, string> = {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...extra,
    };
    return new HttpHeaders(baseHeaders);
  }

  get<T>(url: string, extraHeaders: Record<string, string> = {}) {
    return this.http.get<T>(url, {
      headers: this.getHeaders(extraHeaders),
    });
  }

  post<T>(url: string, body: any, extraHeaders: Record<string, string> = {}) {
    return this.http.post<T>(url, body, {
      headers: this.getHeaders(extraHeaders),
    });
  }

  put<T>(url: string, body: any, extraHeaders: Record<string, string> = {}) {
    return this.http.put<T>(url, body, {
      headers: this.getHeaders(extraHeaders),
    });
  }

  delete<T>(url: string, extraHeaders: Record<string, string> = {}) {
    return this.http.delete<T>(url, {
      headers: this.getHeaders(extraHeaders),
    });
  }
}
