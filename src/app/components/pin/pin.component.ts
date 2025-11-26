import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { QRCodeComponent } from 'angularx-qrcode';
import html2pdf from 'html2pdf.js';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Servicios
import { ProyectoService } from '../../services/proyecto.service';
import { VehiculoService } from '../../services/vehiculo.service';
import { ResolucionService } from '../../services/resolucion.service';
import { ReceptorService } from '../../services/receptor.service';
import { TransportadorService } from '../../services/transportador.service';

// Modelos
import { Proyecto } from '../../models/proyecto.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { Resolucion } from '../../models/resolucion.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    QRCodeComponent, 
    MatIconModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './pin.component.html',
  styleUrls: ['./pin.component.scss']
})
export class PinComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef<HTMLElement>;
  currentUrl: string = '';
  tipo: string = '';
  id: string = '';
  
  // Datos del PIN
  pinData: any = {
    numeroPin: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    razonSocial: '',
    fechaExpedicion: '',
    fechaVencimiento: '',
    ciudadExpedicion: 'Cartagena de Indias',
    tipoPin: '',
    // Campos específicos para proyectos
    fechaInicio: '',
    fechaFinalizacion: '',
    nombreProyecto: '',
    Direccion: '',
    matriculaInmobiliaria: '',
    // Campos específicos para vehículos
    placa: '',
    modelo: '',
    capacidad: '',
    lugarExpedicion: '',
    // Campos específicos para resoluciones
    numeroResolucion: '',
    objetoResolucion: '',
    autoridadAmbiental: '',
    titularResolucion: ''
  };

  loading: boolean = true;
 isAuthenticated: boolean = false;
 public fechaActual: string = '';

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private proyectoService: ProyectoService,
    private vehiculoService: VehiculoService,
    private resolucionService: ResolucionService,
    private receptorService: ReceptorService,
    private transportadorService: TransportadorService
  ) {}

  ngOnInit() {
    
    const hoy = new Date();
this.fechaActual = hoy.toLocaleDateString('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Bogota'
});


      this.isAuthenticated = this.auth.isLoggedIn(); 
    this.currentUrl = window.location.href;
    
    // Capturar los parámetros de la ruta
    this.route.params.subscribe(params => {
      this.tipo = params['tipo'];
      this.id = params['id'];
      
      console.log('Tipo:', this.tipo);
      console.log('ID:', this.id);
      
      // Cargar datos según el tipo
      this.loadPinData();
    });
  }

  async loadPinData() {
    this.loading = true;
    try {
      const idNum = Number(this.id);
      
      switch(this.tipo) {
        case 'proyecto':
          await this.loadProyectoData(idNum);
          break;
        case 'vehiculo':
          await this.loadVehiculoData(idNum);
          break;
        case 'resolucion':
          await this.loadResolucionData(idNum);
          break;
        default:
          this.showErrorAndRedirect('Tipo de PIN no válido');
          this.loading = true;
      }
    } catch (error) {
      console.error('Error cargando datos del PIN:', error);
      this.showErrorAndRedirect('Error al cargar los datos del PIN');
      this.loading = true;
    } finally {
      this.loading = false;
    }
  }

  private async loadProyectoData(id: number) {
    try {
      const proyecto = await this.proyectoService.obtenerProyectoPorId(id);
      
      if (!proyecto || !proyecto.idProyecto) {
        this.loading = true;
        this.showErrorAndRedirect('Proyecto no encontrado');
        return;
      }
      
   this.pinData = {
  ...this.pinData,
  tipoPin: 'GENERADOR',
  tipoIdentificacion: proyecto.generador.tipoDocumento === 'cedula' ? 'Cédula' : proyecto.generador.tipoDocumento || 'N/A',
  numeroIdentificacion: proyecto.generador.numeroDocumento || 'N/A',
  razonSocial: proyecto.generador.razonSocial || `${proyecto.generador.primerNombre || ''} ${proyecto.generador.segundoNombre || ''} ${proyecto.generador.primerApellidos || ''} ${proyecto.generador.segundoApellido || ''}`.trim() || 'N/A',
  numeroPin: proyecto.pin || 'N/A',
  fechaInicio: proyecto.fechaInicio,
  fechaFinalizacion: proyecto.fechaFin,
  nombreProyecto: proyecto.nombre || 'N/A',
  Direccion: proyecto.ubicacion || 'N/A',
  matriculaInmobiliaria: proyecto.matriculaInmobiliaria || 'N/A',
  fechaExpedicion: proyecto.fechaExpedicionPIN ? this.formatDate(proyecto.fechaExpedicionPIN) : 'N/A',
  fechaVencimiento: this.calculateExpirationDateFromDate(1, proyecto.fechaExpedicionPIN)
};

      console.log('Datos del proyecto cargados:', this.pinData);
    } catch (error) {
      console.error('Error cargando proyecto:', error);
       this.loading = true;
      this.showErrorAndRedirect('Error al cargar el proyecto');
    }
  }

  private async loadVehiculoData(id: number) {
    try {
      const vehiculo = await this.vehiculoService.obtenerVehiculoPorId(id);
      
      if (!vehiculo) {
        this.loading = true;
        this.showErrorAndRedirect('Vehículo no encontrado');
        return;
      }
      
      const transportador = await this.transportadorService.obtenerTransportadorPorId(vehiculo.idtransportador);
      
      this.pinData = {
        ...this.pinData,
        tipoPin: 'TRANSPORTADOR',
        numeroPin: vehiculo.pin || 'N/A',
        placa: vehiculo.placaVehiculo || 'N/A',
        modelo: vehiculo.modelo || 'N/A',
        capacidad: vehiculo.capacidad ? `${vehiculo.capacidad} Kg` : 'N/A',
        fechaExpedicion: vehiculo.fechaExpedicionPIN ? this.formatDate(vehiculo.fechaExpedicionPIN) : 'N/A',
        fechaVencimiento: vehiculo.fechaVencimientoPIN ? this.formatDate(vehiculo.fechaVencimientoPIN) : 'N/A',
        razonSocial: transportador.razonSocial || transportador.primerNombre + ' ' + transportador.segundoNombre || 'N/A',
        tipoIdentificacion: transportador.tipoDocumento === 'Cedula' ? 'Cédula' : transportador.tipoDocumento || 'N/A',
        numeroIdentificacion: transportador.numeroDocumento || 'N/A',
        lugarExpedicion: vehiculo.lugarExpedicion || 'CARTAGENA'
      };

      console.log('Datos del vehículo cargados:', this.pinData);
    } catch (error) {
      console.error('Error cargando vehículo:', error);
      this.loading = true;
      this.showErrorAndRedirect('Error al cargar el vehículo');
    }
  }

  private async loadResolucionData(id: number) {
    try {
      const resolucion = await this.resolucionService.obtenerResolucionPorId(id);
      
      if (!resolucion) {
        this.loading = true;
        this.showErrorAndRedirect('Resolución no encontrada');
        return;
      }
      
      const receptor = await this.receptorService.obtenerReceptorPorId(resolucion.idReceptor);

      this.pinData = {
        ...this.pinData,
        tipoPin: 'GESTOR',
        numeroPin: resolucion.pin || 'N/A',
        numeroResolucion: resolucion.numeroResolucion || 'N/A',
       tipoAprovechamiento: resolucion.tipoAprovechamiento ? this.fixEncoding(resolucion.tipoAprovechamiento) : 'N/A',
        fechaExpedicion: resolucion.fechaExpedicionPIN ? this.formatDate(resolucion.fechaExpedicionPIN) : 'N/A',
        fechaVencimiento: this.calculateExpirationDateFromDate(1, resolucion.fechaExpedicionPIN), 
        razonSocial: receptor.razonSocial || receptor.primerNombre + ' ' + receptor.segundoNombre || 'N/A',
        tipoIdentificacion: receptor.tipoDocumento === 'Cedula' ? 'Cédula' : receptor.tipoDocumento || 'N/A',
        numeroIdentificacion: receptor.numeroDocumento || 'N/A',
        direccion: receptor.direccion || 'N/A',
      };

      console.log('Datos de la resolución cargados:', this.pinData);
    } catch (error) {
      console.error('Error cargando resolución:', error);
      this.loading = true;
      this.showErrorAndRedirect('Error al cargar la resolución');
    }
  }

  // Método para mostrar error y redirigir
  private showErrorAndRedirect(message: string): void {
  // Mostrar el mensaje de error brevemente
  this.snackBar.open(message, 'Cerrar', {
    duration: 2000, // Solo 2 segundos, no 5
    panelClass: ['error-snackbar'],
    horizontalPosition: 'center',
    verticalPosition: 'top'
  });

  // Redirigir inmediatamente al home
  this.router.navigate(['/home']);
  }

  public formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    
    try {
      let d: Date;
      
      if (typeof date === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          d = new Date(date + 'T00:00:00-05:00');
        } else {
          d = new Date(date);
        }
      } else {
        d = new Date(date);
      }
      
      if (isNaN(d.getTime())) return 'N/A';
      
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/Bogota'
      };
      
      return d.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'N/A';
    }
  }

  private calculateExpirationDateFromDate(years: number, startDate: Date | string = new Date()): string {
    try {
      const baseDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
      
      if (isNaN(baseDate.getTime())) {
        console.error('Fecha de inicio no válida:', startDate);
        return 'N/A';
      }
      
      const expirationDate = new Date(baseDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + years);
      
      return this.formatDate(expirationDate);
    } catch (error) {
      console.error('Error calculando fecha de expiración:', error);
      return 'N/A';
    }
  }

fixEncoding(str: string): string {
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}
  generatePdf(): void {
    const element = this.pdfContent.nativeElement;
    const options = {
      margin: 0.2,
      filename: `pin-${this.tipo}-${this.id}.pdf`,
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
      width: 816, // 8.5in * 96dpi
      height: 1056, // 11in * 96dpi
      windowWidth: 816 // Forzar el ancho
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: "portrait" as "portrait" 
      }
    };
    html2pdf().set(options).from(element).save();
  }
}