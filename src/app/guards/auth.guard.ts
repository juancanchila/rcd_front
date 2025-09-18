import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 🚨 Rutas públicas que NO requieren autenticación
    const publicRoutes = ['/splash', '/login'];
    
    // Si es una ruta pública, permite el acceso
    if (publicRoutes.includes(state.url)) {
      return true;
    }

    // 🔐 Verificar si tiene token
    const token = localStorage.getItem('token');
    
    if (token) {
      return true; // Tiene token, permite acceso
    } else {
      // No tiene token, redirige a login
      this.router.navigate(['/login']);
      return false;
    }
  }
}