/* tslint:disable */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SavingService } from './saving.service';
import { Drawings } from '@common/classes/drawings';

describe('SavingService', () => {
    let service: SavingService;
    let httpMock: HttpTestingController;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasStub: HTMLCanvasElement;
    let previewCtxStub: CanvasRenderingContext2D;
    let baseCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, SavingService, useValue: drawServiceSpy }],
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(SavingService);
        httpMock = TestBed.inject(HttpTestingController);

        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should post the correct data', () => {
        let image = new Image(200, 200) as HTMLImageElement;
        const newDrawing: Drawings = {
            name: 'dummyName',
            tag: ['tagUn', 'tagDeux'],
            imageData: 'imageData',
        };

        service.addDrawing(image, newDrawing).subscribe((data) => {
            expect(data.name).toBe('dummyName');
            expect(data.tag).toBe(['tagUn', 'tagDeux']);
            expect(data.imageData).toBe('imageData');
        });

        const req = httpMock.expectOne('http://localhost:3000/api/drawings', 'put to api');

        expect(req.request.method).toBe('POST');
        httpMock.verify();
    });

    it('should call createImageToExport when addDrawing is Called ', () => {
        let image = new Image(200, 200) as HTMLImageElement;
        const newDrawing: Drawings = {
            name: 'dummyName',
            tag: ['tagUn', 'tagDeux'],
            imageData: 'imageData',
        };
        let createImageToExportSpy = spyOn(service as any, 'createImageToExport');
        document.createElement('a').click = jasmine.createSpy();
        service.addDrawing(image, newDrawing);
        expect(createImageToExportSpy).toHaveBeenCalled();
    });

    it('should call toDataURL when createBaseImage is Called ', () => {
        let toDataURLSpy = spyOn(canvasStub, 'toDataURL');
        service.createBaseImage();
        expect(toDataURLSpy).toHaveBeenCalled();
    });
});
