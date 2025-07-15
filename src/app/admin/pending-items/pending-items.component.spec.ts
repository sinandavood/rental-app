import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingItemsComponent } from './pending-items.component';

describe('PendingItemsComponent', () => {
  let component: PendingItemsComponent;
  let fixture: ComponentFixture<PendingItemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PendingItemsComponent]
    });
    fixture = TestBed.createComponent(PendingItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
