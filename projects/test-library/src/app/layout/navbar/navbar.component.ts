import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
 @Output() toggleSidebarEvent = new EventEmitter<void>();
  private readonly router=inject(Router)
  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }
  logout() {
this.router.navigate(['/login']);
  }
}
