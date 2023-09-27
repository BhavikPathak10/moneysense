import { TestBed } from '@angular/core/testing';

import { SafeboxService } from './safebox.service';

describe('SafeboxService', () => {
  let service: SafeboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafeboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
