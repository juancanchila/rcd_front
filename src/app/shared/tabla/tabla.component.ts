import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TABLA_CONFIG } from '../../config/tabla-config';

// Modelos
import { Generador } from '../../models/generador.model';
import { Transportador } from '../../models/transportador.model';
import { Receptor } from '../../models/receptor.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { Resolucion } from '../../models/resolucion.model';
import { Proyecto } from '../../models/proyecto.model';
import { VisitaTecnica } from '../../models/visitatecnica.model';
import { ReporteImpPmaRcd } from '../../models/reporteimp.model';
import { User } from '../../models/user.model';

// Servicios
import { GeneradorService } from '../../services/generador.service';
import { TransportadorService } from '../../services/transportador.service';
import { ReceptorService } from '../../services/receptor.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ResolucionService } from '../../services/resolucion.service';
import { ProyectoService } from '../../services/proyecto.service';
import { VisitaTecnicaService } from '../../services/visitatecnica.service';
import { ReporteImpPmaRcdService } from '../../services/reporteimp-pma.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment.prod';

type TipoEntidad =
  | 'usuarios'
  | 'generador'
  | 'transportador'
  | 'receptor'
  | 'vehiculo'
  | 'resolucion'
  | 'proyecto'
  | 'visitatecnica'
  | 'reporte';

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.scss'],
})
export class TablaComponent implements OnChanges {
  @Input() tipo: TipoEntidad = 'generador';
  @Input() actions: string[] = [];

  encabezados: string[] = [];
  campos: string[] = [];
  data: any[] = [];
  total: number = 0;
  limit: number = 50;
  offset: number = 0;
  loading: boolean = false;
  private baseUrl = environment.API_URL;
  // 👇 Formulario de búsqueda
  busquedaForm: FormGroup;

  constructor(
    private generadorService: GeneradorService,
    private transportadorService: TransportadorService,
    private receptorService: ReceptorService,
    private vehiculoService: VehiculoService,
    private resolucionService: ResolucionService,
    private proyectoService: ProyectoService,
    private visitaTecnicaService: VisitaTecnicaService,
    private reporteService: ReporteImpPmaRcdService,
    private userService: UserService,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.busquedaForm = this.fb.group({
      valor: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipo'] && changes['tipo'].currentValue) {
      this.encabezados = TABLA_CONFIG[this.tipo].encabezados;
      this.campos = TABLA_CONFIG[this.tipo].campos;
      this.offset = 0;
      this.loadData();
    }
  }

  async buscar() {
    const valor = this.busquedaForm.get('valor')?.value?.trim();
    if (!valor) return this.loadData();

    this.loading = true;
    try {
      const url = `${this.baseUrl}/pin?tipo=${this.tipo}&valor=${valor}`;
      const res: any = await this.http.get(url).toPromise();
console.log(res,"Respuesta búsqueda");
      // 👇 Adaptamos respuesta
      let lista: any[] = [];
      if (res) {
        lista = [res]; // siempre un único objeto
        this.total = 1;
      }

      switch (this.tipo) {
        case 'generador': this.data = lista.map(r => Generador.fromResponse(r)); break;
        case 'transportador': this.data = lista.map(r => Transportador.fromResponse(r)); break;
        case 'receptor': this.data = lista.map(r => Receptor.fromResponse(r)); break;
        case 'vehiculo': this.data = lista.map(r => Vehiculo.fromResponse(r)); break;
        case 'resolucion': this.data = lista.map(r => Resolucion.fromResponse(r)); break;
        case 'proyecto': this.data = lista.map(r => Proyecto.fromResponse(r)); break;
        case 'visitatecnica': this.data = lista.map(r => VisitaTecnica.fromResponse(r)); break;
        case 'reporte': this.data = lista.map(r => ReporteImpPmaRcd.fromResponse(r)); break;
        case 'usuarios': this.data = lista.map(r => User.fromResponse(r)); break;
      }

      console.log(this.data,"Datos cargados")
    } catch (err) {
      console.error('❌ Error en búsqueda:', err);
      this.data = [];
      this.total = 0;
    } finally {
      this.loading = false;
    }
  }

  resetBusqueda() {
    this.busquedaForm.reset();
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      let response: any;
      switch (this.tipo) {
        case 'generador': this.actions = ['ver']; response = await this.generadorService.obtenerGeneradores(this.limit, this.offset); break;
        case 'transportador': this.actions = ['ver']; response = await this.transportadorService.obtenerTransportadores(this.limit, this.offset); break;
        case 'receptor': this.actions = ['ver']; response = await this.receptorService.obtenerReceptores(this.limit, this.offset); break;
        case 'vehiculo': this.actions = ['ver', 'ver pin']; response = await this.vehiculoService.obtenerVehiculos(this.limit, this.offset); break;
        case 'resolucion': this.actions = ['ver', 'ver pin']; response = await this.resolucionService.obtenerResoluciones(this.limit, this.offset); break;
        case 'proyecto': this.actions = ['ver', 'ver pin']; response = await this.proyectoService.obtenerProyectos(this.limit, this.offset); break;
        case 'visitatecnica': this.actions = ['ver']; response = await this.visitaTecnicaService.obtenerVisitasTecnicas(this.limit, this.offset); break;
        case 'reporte': this.actions = ['ver']; response = await this.reporteService.obtenerReportes(this.limit, this.offset); break;
        case 'usuarios': this.actions = ['ver']; response = await this.userService.obtenerUsuarios(this.limit, this.offset); break;
        default: response = { data: [], total: 0 };
      }

      let lista: any[] = [];
      if (response?.data) {
        lista = response.data;
        this.total = response.total ?? lista.length;
      } else if (Array.isArray(response)) {
        this.total = response.length;
        lista = response.slice(this.offset, this.offset + this.limit);
      } else {
        lista = [];
        this.total = 0;
      }

      switch (this.tipo) {
        case 'generador': this.data = lista.map(r => Generador.fromResponse(r)); break;
        case 'transportador': this.data = lista.map(r => Transportador.fromResponse(r)); break;
        case 'receptor': this.data = lista.map(r => Receptor.fromResponse(r)); break;
        case 'vehiculo': this.data = lista.map(r => Vehiculo.fromResponse(r)); break;
        case 'resolucion': this.data = lista.map(r => Resolucion.fromResponse(r)); break;
        case 'proyecto': this.data = lista.map(r => Proyecto.fromResponse(r)); break;
        case 'visitatecnica': this.data = lista.map(r => VisitaTecnica.fromResponse(r)); break;
        case 'reporte': this.data = lista.map(r => ReporteImpPmaRcd.fromResponse(r)); break;
        case 'usuarios': this.data = lista.map(r => User.fromResponse(r)); break;
      }

      console.log('Datos cargados:', this.data);

    } catch (err) {
      console.error(`Error cargando ${this.tipo}:`, err);
      this.data = [];
      this.total = 0;
    } finally {
      this.loading = false;
    }
  }

  getValue(item: any, campo: string): any {
    if (!item || !campo) return null;
    if (campo.includes('.')) {
      return campo.split('.').reduce((acc: any, key: string) => acc ? acc[key] : null, item);
    }
    return item[campo];
  }

  onAccion(accion: string, id: number): void {
    if (accion === 'ver') return this.verDetalle(id);
    if (accion === 'editar') return this.editarDetalle(id);
    if (accion === 'eliminar') return this.eliminarDetalle(id);
    if (accion === 'ver pin') return this.verPin(id);
  }

  verDetalle(id: number): void { this.router.navigate([`/${this.tipo}-detalle`, id]); }
  editarDetalle(id: number): void { console.log('EDITAR:', this.tipo, id); }
  eliminarDetalle(id: number): void { console.log('ELIMINAR:', this.tipo, id); }
  verPin(id: number): void { this.router.navigate([`pin/${this.tipo}`, id]); }

  onPageChange(next: boolean) {
    this.offset += next ? this.limit : -this.limit;
    if (this.offset < 0) this.offset = 0;
    if (this.offset >= this.total) this.offset = this.total - this.limit;
    if (this.offset < 0) this.offset = 0;
    this.loadData();
  }

  get paginaActual(): number { return Math.floor(this.offset / this.limit) + 1; }
  get totalPaginas(): number { return Math.ceil(this.total / this.limit); }
}
