import { TestBed } from '@angular/core/testing';

import { ItemmasterService } from './itemmaster.service';

describe('ItemmasterService', () => {
  let service: ItemmasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemmasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
