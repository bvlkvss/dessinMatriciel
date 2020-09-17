import { TestBed } from '@angular/core/testing';
import { ToolsManagerService } from './tools-manager.service';

describe('ToolsManagerService', () => {
    let service: ToolsManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToolsManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
