// src/app/services/sitemap.service.ts
import { Injectable } from '@angular/core';
import { routes } from '../app.routes';

export interface SiteMapItem {
  path: string;
  children?: SiteMapItem[];
}

@Injectable({ providedIn: 'root' })
export class SitemapService {
  constructor() {}

  getSiteMap(): SiteMapItem[] {
    return this.mapRoutes(routes);
  }

  private mapRoutes(routesArray: any[], parentPath: string = ''): SiteMapItem[] {
    const sitemap: SiteMapItem[] = [];

    for (const r of routesArray) {
      // Ignorar rutas comodín
      if (r.path === '**') continue;

      // Construir ruta completa
      const fullPath = parentPath + (r.path ? `/${r.path}` : '');

      const item: SiteMapItem = { path: fullPath };

      // Si tiene hijos, mapearlos recursivamente
      if (r.children && r.children.length > 0) {
        item.children = this.mapRoutes(r.children, fullPath);
      }

      sitemap.push(item);
    }

    return sitemap;
  }
}
