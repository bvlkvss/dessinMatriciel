import { TestBed } from '@angular/core/testing';

import { ResizingService } from './resizing.service';

describe('ResizingService', () => {
  let service: ResizingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResizingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
