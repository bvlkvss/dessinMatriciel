/* tslint:disable */
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportService } from './export.service';

describe('ExportService', () => {
    let service: ExportService;
    let httpMock: HttpTestingController
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
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
            ],
            imports: [HttpClientTestingModule]
        });
        service = TestBed.inject(ExportService);
        httpMock = TestBed.inject(HttpTestingController)
        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call http post when sendEmailRequest is called', () => {
        const SERVER_URL = 'http://localhost:3000/api/emails';
        service.sendEmailRequest();
        const req = httpMock.expectOne(`${SERVER_URL}`);
        expect(req.request.method).toBe("POST");
    });

    it('should call sendEmailRequest when sendEmailDataToServer is called', () => {
        service.sendEmailRequest = jasmine.createSpy();
        let image = new Image(200, 200) as HTMLImageElement;
        service.sendEmailDataToServer(image, 'ss', 'ss', 'ss', 'ss');
        expect(service.sendEmailRequest).toHaveBeenCalled();
    });

    it('should set image style to the given one when setFilter is called', () => {
        let image = new Image(200, 200) as HTMLImageElement;
        service.setFilter(image, 'blur(5px)');
        expect(image.style.filter).toEqual('blur(5px)');
    });

    it('should call toDataURL when createBaseImage is Called ', () => {
        let toDataURLSpy = spyOn(canvasStub, 'toDataURL');
        service.createBaseImage();
        expect(toDataURLSpy).toHaveBeenCalled();
    });

    it('should set emailData when createEmailData is called ', () => {
        service.emailData = { image: 'im', type: 'png', name: 'ss', email: 'lallala' };
        service.createEmailData('ss', 'ss', 'ss', 'ss');
        expect(service.emailData).toEqual({ image: 'ss', type: 'ss', email: 'ss', name: 'ss' });
    });

    it('should call createImageToExport when exportImage is Called ', () => {
        let image = new Image(200, 200) as HTMLImageElement;
        let createImageToExportSpy = spyOn(service as any, 'createImageToExport');
        document.createElement('a').click = jasmine.createSpy();
        service.exportImage(image, 'dummyName', 'dummyFilter', 'dummyType');
        expect(createImageToExportSpy).toHaveBeenCalled();
    });

    it('should call drawImage when createImageToExport is Called ', () => {
        previewCtxStub.drawImage = jasmine.createSpy();
        (service as any).createImageToExport();
        expect(previewCtxStub.drawImage).toHaveBeenCalled();
    });
});
