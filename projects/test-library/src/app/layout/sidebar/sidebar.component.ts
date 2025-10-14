import { Component, Input } from '@angular/core';
import { MenuItem } from '../../invopay/interface/MenuItem';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
@Input() isCollapsed = false;
    revenueSubmenuOpen = false;
     navigationItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Comisiones', route: '/comisiones' },
    { label: 'Liquidaciones', route: '/liquidaciones' }
  ];

  reportItems: MenuItem[] = [
    { label: 'Resumen Ejecutivo', route: '/resumen-ejecutivo' },
    { label: 'Facturas', route: '/facturas' }
  ];
  toggleRevenueSubmenu() {
    if (!this.isCollapsed) {
      this.revenueSubmenuOpen = !this.revenueSubmenuOpen;
    }
  }
}
