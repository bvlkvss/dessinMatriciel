import { TestBed } from '@angular/core/testing';

import { SprayPaintService } from './spray-paint.service';

describe('SprayPaintService', () => {
    let service: SprayPaintService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SprayPaintService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
