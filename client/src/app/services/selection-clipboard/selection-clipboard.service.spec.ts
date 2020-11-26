import { TestBed } from '@angular/core/testing';

import { SelectionClipboardService } from './selection-clipboard.service';

describe('SelectionClipboardService', () => {
  let service: SelectionClipboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionClipboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
