import { Component, OnInit } from '@angular/core';
import { SitemapService, SiteMapItem } from '../services/sitemap.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedFooterComponent } from '../shared/shared-footer/shared-footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    SharedFooterComponent,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
  ],
})
export class SitemapComponent implements OnInit {
  sitemap: SiteMapItem[] = [];

  constructor(private sitemapService: SitemapService, private router: Router) {}

  ngOnInit(): void {
    this.sitemap = this.sitemapService.getSiteMap();
  }

  navigate(path: string): void {
    if (path) {
      this.router.navigate([path]);
    }
  }
}
