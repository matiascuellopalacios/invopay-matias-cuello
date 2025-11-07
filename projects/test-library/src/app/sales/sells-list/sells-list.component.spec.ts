import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellsListComponent } from './sells-list.component';

describe('SellsListComponent', () => {
  let component: SellsListComponent;
  let fixture: ComponentFixture<SellsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SellsListComponent]
    });
    fixture = TestBed.createComponent(SellsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
