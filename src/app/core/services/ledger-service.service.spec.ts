import { TestBed } from '@angular/core/testing';

import { LedgerServiceService } from './ledger-service.service';

describe('LedgerServiceService', () => {
  let service: LedgerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LedgerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
