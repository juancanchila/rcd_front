// src/app/services/rol.service.ts
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Rol } from '../models/rol.model';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly url = `${environment.API_URL}/roles`;

  constructor(private http: HttpService) {}

  getRoles() {
    return this.http.get<Rol[]>(this.url);
  }
}