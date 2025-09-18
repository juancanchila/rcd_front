// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Componentes públicos
import { SplashComponent } from './components/splash.component';
import { LoginComponent } from './components/login.component';

// Layout principal y protegido
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';
import { AuthGuard } from './guards/auth.guard';

// Componentes del layout
import { HomeComponent } from './components/home.component';
import { PerfilComponent } from './components/perfil.component';
import { ListaPageComponent } from './components/lista-page.component';
import { SitemapComponent } from './components/sitemap.component';
import { PinesVigentesComponent } from './components/pines/pines-vigentes.component';
import { PinComponent } from './components/pin/pin.component';
import { PinConsultaComponent } from './components/consulta/pin-consulta.component';
import { UsuariosEditComponent } from './components/perfildetail/usuarios-edit.component';

// Detalles
import { DetalleGeneradorComponent } from './components/generadordetail/detalle-generador.component';
import { DetalleProyectoComponent } from './components/proyectodetail/detalle-proyecto.component';
import { DetalleVisitaComponent } from './components/visitadetail/detalle-visita.component';
import { DetalleReporteComponent } from './components/reportedetail/detalle-reporte.component';
import { DetalleReceptorComponent } from './components/receptortedetail/detalle-receptor.component';
import { ResoluciondetalleComponent } from './components/resoluciondetail/resoluciondetalle.component';
import { DetalleTransportadorComponent } from './components/transportadordetail/detalle-transportador.component';
import { VehiculodetalleComponent } from './components/vehiculodetail/vehiculodetalle.component';

export const routes: Routes = [
  // 🔹 Rutas públicas
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: 'splash', component: SplashComponent },
  { path: 'login', component: LoginComponent },

  // 🔹 Rutas protegidas con layout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // ✅ Dashboard y páginas principales con guard
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
      { path: 'sitemap', component: SitemapComponent, canActivate: [AuthGuard] },
      { path: 'lista/:tipo', component: ListaPageComponent, canActivate: [AuthGuard] },

      // ✅ Páginas de detalle (guard opcional según necesidad)
      { path: 'generador-detalle/:id', component: DetalleGeneradorComponent, canActivate: [AuthGuard] },
      { path: 'proyecto-detalle/:id', component: DetalleProyectoComponent, canActivate: [AuthGuard] },
      { path: 'visitatecnica-detalle/:id', component: DetalleVisitaComponent, canActivate: [AuthGuard] },
      { path: 'reporte-detalle/:id', component: DetalleReporteComponent, canActivate: [AuthGuard] },
      { path: 'receptor-detalle/:id', component: DetalleReceptorComponent, canActivate: [AuthGuard] },
      { path: 'resolucion-detalle/:id', component: ResoluciondetalleComponent, canActivate: [AuthGuard] },
      { path: 'transportador-detalle/:id', component: DetalleTransportadorComponent, canActivate: [AuthGuard] },
      { path: 'vehiculo-detalle/:id', component: VehiculodetalleComponent, canActivate: [AuthGuard] },
      { path: 'usuarios-detalle/:id', component: UsuariosEditComponent, canActivate: [AuthGuard] },

      // ✅ Pines y consultas
      { path: 'pines', component: PinesVigentesComponent },
      { path: 'pin/:tipo/:id', component: PinComponent },
      { path: 'consulta', component: PinConsultaComponent },
    ],
  },

  // 🔹 Fallback
  { path: '**', redirectTo: 'splash' },
];
