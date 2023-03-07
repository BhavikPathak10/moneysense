import { TestBed } from '@angular/core/testing';

import { PendingPaymentService } from './pending-payment.service';

describe('PendingPaymentService', () => {
  let service: PendingPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
