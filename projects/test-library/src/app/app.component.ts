import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'test-library';
  isSidebarCollapsed = false;
  hideChrome = false;
  private sub: Subscription;

  constructor(private router: Router) {
    this.updateChromeVisibility(this.router.url);
    this.sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateChromeVisibility(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  private updateChromeVisibility(url: string) {
    const clean = url.split('?')[0];
    this.hideChrome = clean === '/' || clean === '' || clean === '/login';
  }
}
