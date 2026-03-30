import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalOverlayService {
  private readonly modalOpenSubject = new BehaviorSubject<boolean>(false);
  
  modalOpen$ = this.modalOpenSubject.asObservable();
  
  setModalOpen(isOpen: boolean): void {
    this.modalOpenSubject.next(isOpen);
  }
  
  isModalOpen(): boolean {
    return this.modalOpenSubject.getValue();
  }
}
