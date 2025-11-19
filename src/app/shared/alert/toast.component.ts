import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,        // 🔥 HAZLO STANDALONE
  imports: [CommonModule], // 🔥 AGREGA ESTO PARA QUE FUNCIONE *ngIf
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {

  message: ToastMessage | null = null;
  visible = false;

  constructor(private toastService: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.toastService.toastState.subscribe(msg => {
      this.message = msg;
      this.visible = true;

      setTimeout(() => {
        this.visible = false;

        if (msg.redirectUrl) {
          this.router.navigate([msg.redirectUrl]);
        }
      }, 3000);
    });
  }
}
