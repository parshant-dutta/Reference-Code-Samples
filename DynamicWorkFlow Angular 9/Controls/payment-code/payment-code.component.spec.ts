import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCodeComponent } from './payment-code.component';

describe('PaymentCodeComponent', () => {
  let component: PaymentCodeComponent;
  let fixture: ComponentFixture<PaymentCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
