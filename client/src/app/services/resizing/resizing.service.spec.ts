/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizingService } from './resizing.service';

describe('ResizingService', () => {
    let service: ResizingService;
    let canvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({ providers: [{ provide: DrawingService, useValue: drawServiceSpy }] });
        service = TestBed.inject(ResizingService);
        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas.width = canvasStub.width;
        service['drawingService'].canvas.height = canvasStub.height;
        service['drawingService'].baseCtx.canvas.width = baseCtxStub.canvas.width; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx.canvas.width = previewCtxStub.canvas.width;
        service['drawingService'].baseCtx.canvas.height = baseCtxStub.canvas.height; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx.canvas.height = previewCtxStub.canvas.height;
        service['drawingService'].gridCanvas = document.createElement('canvas');
        service['drawingService'].gridCanvas.width = 100;
        service['drawingService'].gridCanvas.height = 100;
        service['drawingService'].gridCtx = service['drawingService'].gridCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set resizing to true when initResizing is called if mouseEvent is leftClick', () => {
        service.resizing = false;
        function dummyFunction() { }
        let mouseEvent = { button: 0, target: { className: 'lala' }, preventDefault: dummyFunction } as any;
        service.initResizing(mouseEvent);
        expect(service.resizing).toEqual(true);
    });

    it('should not set resizing to true when initResizing is called if mouseEvent is not leftClick', () => {
        service.resizing = false;
        function dummyFunction() { }
        let mouseEvent = { button: 1, target: { className: 'lala' }, preventDefault: dummyFunction } as any;
        service.initResizing(mouseEvent);
        expect(service.resizing).toEqual(false);
    });

    it('should set resizeWidth to minWidth if smaller than minSize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let div = document.createElement('div') as HTMLDivElement;
        let rect = { left: 200 } as any;
        spyOn(div, 'getBoundingClientRect').and.returnValue(rect);
        let event = { pageX: 300 } as MouseEvent;
        service.resizeFromRight(event, div, canvas);
        expect(service.resizedWidth).toEqual(250);
    });

    it('should set resizeWidth to resizedWidth if bigger than minSize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let div = document.createElement('div') as HTMLDivElement;
        let rect = { left: 200 } as any;
        spyOn(div, 'getBoundingClientRect').and.returnValue(rect);
        let event = { pageX: 700 } as MouseEvent;
        service.resizeFromRight(event, div, canvas);
        expect(service.resizedWidth).toEqual(500);
    });

    it('should set resizeHeight to resizedHeight if bigger than minSize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let div = document.createElement('div') as HTMLDivElement;
        let rect = { top: 200 } as any;
        spyOn(div, 'getBoundingClientRect').and.returnValue(rect);
        let event = { pageY: 700 } as MouseEvent;
        service.resizeFromBottom(event, div, canvas);
        expect(service.resizedHeight).toEqual(500);
    });

    it('should set resizeHeight to resizedHeight if smaller than minSize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let div = document.createElement('div') as HTMLDivElement;
        let rect = { top: 200 } as any;
        spyOn(div, 'getBoundingClientRect').and.returnValue(rect);
        let event = { pageY: 300 } as MouseEvent;
        service.resizeFromBottom(event, div, canvas);
        expect(service.resizedHeight).toEqual(250);
    });

    it('should set resizeHeight and resizedWidth to givenSize if bigger than minSize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let div = document.createElement('div') as HTMLDivElement;
        let rect = { top: 200, left: 200 } as any;
        spyOn(div, 'getBoundingClientRect').and.returnValue(rect);
        let event = { pageX: 700, pageY: 700 } as MouseEvent;
        service.resizeFromBottomRight(event, div, canvas);
        expect(service.resizedHeight).toEqual(500);
        expect(service.resizedWidth).toEqual(500);
    });

    it('should call resizerRight if current is resizerRight when calling resize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let canvas2 = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let div = document.createElement('div') as HTMLDivElement;
        document.querySelector = jasmine.createSpy('HTML div element').and.returnValue(div);
        let resizerRightSpy = spyOn(service, 'resizeFromRight');
        let event = { button: 0, pageX: 700, pageY: 700 } as MouseEvent;
        service.currentResizer = 'resizer right';
        service.resizing = true;
        (service as any).drawingService.canvasContainer = div;
        service.resize(event, canvas, canvas2);
        expect(resizerRightSpy).toHaveBeenCalled();
    });

    it('should call resizerBottomRight if current is resizerBottomRight when calling resize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let canvas2 = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        let div = document.createElement('div') as HTMLDivElement;
        document.querySelector = jasmine.createSpy('HTML div element').and.returnValue(div);
        let resizerBottomRightSpy = spyOn(service, 'resizeFromBottomRight');
        let event = { button: 0, pageX: 700, pageY: 700 } as MouseEvent;
        service.currentResizer = 'resizer bottom-right';
        service.resizing = true;
        (service as any).drawingService.canvasContainer = div;
        service.resize(event, canvas, canvas2);
        expect(resizerBottomRightSpy).toHaveBeenCalled();
    });

    it('should call resizerBottom if current is resizerBottom when calling resize', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let canvas2 = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        let div = document.createElement('div') as HTMLDivElement;
        document.querySelector = jasmine.createSpy('HTML div element').and.returnValue(div);
        let resizerBottomSpy = spyOn(service, 'resizeFromBottom');
        let event = { button: 0, pageX: 700, pageY: 700 } as MouseEvent;
        service.currentResizer = 'resizer bottom';
        service.resizing = true;
        (service as any).drawingService.canvasContainer = div;
        service.resize(event, canvas, canvas2);
        expect(resizerBottomSpy).toHaveBeenCalled();
    });

    it('should not call resizerBottom if current is resizerBottom when calling resize and resizing is false', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let canvas2 = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        let div = document.createElement('div') as HTMLDivElement;
        document.querySelector = jasmine.createSpy('HTML div element').and.returnValue(div);
        let resizerBottomSpy = spyOn(service, 'resizeFromBottom');
        let event = { button: 0, pageX: 700, pageY: 700 } as MouseEvent;
        service.currentResizer = 'resizer bottom';
        service.resizing = false;
        (service as any).drawingService.canvasContainer = div;
        service.resize(event, canvas, canvas2);
        expect(resizerBottomSpy).not.toHaveBeenCalled();
    });

    it('should not call resizerBottom if current is resizerBottom when calling resize and resizing is true but is not a mouse left click', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let canvas2 = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;

        let div = document.createElement('div') as HTMLDivElement;
        document.querySelector = jasmine.createSpy('HTML div element').and.returnValue(div);
        let resizerBottomSpy = spyOn(service, 'resizeFromBottom');
        let event = { button: 1, pageX: 700, pageY: 700 } as MouseEvent;
        service.currentResizer = 'resizer bottom';
        service.resizing = true;
        (service as any).drawingService.canvasContainer = div;
        service.resize(event, canvas, canvas2);
        expect(resizerBottomSpy).not.toHaveBeenCalled();
    });

    it('should call drawCanvas when stopResize is called', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let event = { button: 1, pageX: 700, pageY: 700 } as MouseEvent;
        let drawCanvasSpy = spyOn(service, 'drawCanvas');
        service.stopResize(event, canvas);
        expect(drawCanvasSpy).toHaveBeenCalled();
    });

    it('should set resizing to false if resizing is true when stopResize is called', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        let event = { button: 1, pageX: 700, pageY: 700 } as MouseEvent;
        let drawCanvasSpy = spyOn(service, 'drawCanvas');
        service.resizing = true;
        service.stopResize(event, canvas);
        expect(drawCanvasSpy).toHaveBeenCalled();
        expect(service.resizing).toEqual(false);
    });

    it('should call clearCanvas if it has been resized when  drawCanvas is Called', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        service.hasBeenResized = true;
        service.drawCanvas(canvas);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should not call clearCanvas if it has not been resized when  drawCanvas is Called', () => {
        let canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        service.hasBeenResized = false;
        service.drawCanvas(canvas);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    });
});
