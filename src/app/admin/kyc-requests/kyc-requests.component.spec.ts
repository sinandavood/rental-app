import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycRequestsComponent } from './kyc-requests.component';

describe('KycRequestsComponent', () => {
  let component: KycRequestsComponent;
  let fixture: ComponentFixture<KycRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KycRequestsComponent]
    });
    fixture = TestBed.createComponent(KycRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
