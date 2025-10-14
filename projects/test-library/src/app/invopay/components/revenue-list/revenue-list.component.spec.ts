import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueListComponent } from './revenue-list.component';

describe('RevenueListComponent', () => {
  let component: RevenueListComponent;
  let fixture: ComponentFixture<RevenueListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RevenueListComponent]
    });
    fixture = TestBed.createComponent(RevenueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
