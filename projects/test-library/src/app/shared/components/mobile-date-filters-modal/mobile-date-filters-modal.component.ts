import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-date-filters-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './mobile-date-filters-modal.component.html',
  styleUrls: ['./mobile-date-filters-modal.component.scss']
})
export class MobileDateFiltersModalComponent {
  @Input() open = false;
  @Input() title = '';
  
  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  onOverlayClick(): void {
    this.close();
  }

  onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.close();
  }

  private close(): void {
    if (!this.open) {
      return;
    }
    this.open = false;
    this.openChange.emit(false);
    this.closed.emit();
  }
}
