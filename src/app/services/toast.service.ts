import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  type: 'success' | 'error';
  text: string;
  redirectUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {

  private toastSubject = new Subject<ToastMessage>();
  toastState = this.toastSubject.asObservable();

  showSuccess(text: string, redirectUrl?: string) {
    this.toastSubject.next({ type: 'success', text, redirectUrl });
  }

  showError(text: string, redirectUrl?: string) {
    this.toastSubject.next({ type: 'error', text, redirectUrl });
  }
}
