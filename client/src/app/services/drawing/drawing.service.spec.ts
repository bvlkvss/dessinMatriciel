/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from './drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;
    let clearRectSpy: jasmine.Spy<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.gridCanvas = document.createElement('canvas');
        service.gridCanvas.width =100;
        service.gridCanvas.height = 100;
        service.gridCtx = service.gridCanvas.getContext('2d') as CanvasRenderingContext2D;
        clearRectSpy = spyOn<any>(service.baseCtx, 'clearRect').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('clearCavas should call clear rect', () => {
        service.clearCanvas(service.baseCtx);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('restoreCanval should call restore and save', () => {
        let restoreSpy = spyOn(service.baseCtx, 'restore');
        let saveSpy = spyOn(service.baseCtx, 'save');
        service.restoreCanvasState();
        expect(restoreSpy).toHaveBeenCalled();
        expect(saveSpy).toHaveBeenCalled();
    });

    it('newDrawing should call window confirm', () => {
        window.confirm = jasmine.createSpy();
        service.newDrawing();
        expect(window.confirm).toHaveBeenCalled();
    });

    it('newDrawing should call window confirm and call clearCanvas if user confirms', () => {
        window.confirm = jasmine.createSpy().and.returnValue(true);
        let resizeCanvasSpy = spyOn(service, 'resizeCanvas');
        service.newDrawing();
        expect(window.confirm).toHaveBeenCalled();
        expect(resizeCanvasSpy).toHaveBeenCalled();
    });

    it('resizeCanvas should set canvasSize to 250X250 if width and height are less than 500', () => {
        let element = { clientWidth: 300, clientHeight: 300 } as HTMLElement;
        let element2 = { clientWidth: 300, clientHeight: 700 } as HTMLElement;
        let elementArray = [element, element2] as any;
        spyOn(document, 'querySelectorAll').and.returnValue(elementArray);
        service.resizeCanvas();
        expect(service.canvasSize.x).toEqual(250);
    });

    it('resizeCanvas should set canvasSize.x to 350  if workspace width is 750', () => {
        let element = { clientWidth: 750, clientHeight: 700 } as HTMLElement;
        let element2 = { clientWidth: 300, clientHeight: 700 } as HTMLElement;
        let elementArray = [element, element2] as any;
        spyOn(document, 'querySelectorAll').and.returnValue(elementArray);
        service.resizeCanvas();
        expect(service.canvasSize.x).toEqual(350);
    });
});
