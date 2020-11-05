/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from './export.service';

describe('ExportService', () => {
    let service: ExportService;
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
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(ExportService);
        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set image style to the given one when setFilter is called', () => {
        let image = new Image(200,200) as HTMLImageElement;
        service.setFilter(image, "blur(5px)");
        expect(image.style.filter).toEqual("blur(5px)")
    });

    it('should call toDataURL when createBaseImage is Called ', () => {
        let toDataURLSpy = spyOn(canvasStub, 'toDataURL');
        service.createBaseImage();
        expect(toDataURLSpy).toHaveBeenCalled();
    });

    it('should call createImageToExport when exportImage is Called ', () => {
        let image = new Image(200,200) as HTMLImageElement;
        let createImageToExportSpy = spyOn(service as any, 'createImageToExport');
        document.createElement('a').click = jasmine.createSpy();
        service.exportImage(image, "dummyName", "dummyFilter", "dummyType");
        expect(createImageToExportSpy).toHaveBeenCalled();
    });

    it('should call drawImage when createImageToExport is Called ', () => {
        previewCtxStub.drawImage = jasmine.createSpy();
        (service as any).createImageToExport();
        expect(previewCtxStub.drawImage).toHaveBeenCalled();
    });

});
