/* tslint:disable */
import { TestBed } from '@angular/core/testing';
//import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PaintBucketService } from './paint-bucket.service';

describe('PaintBucketService', () => {
    let service: PaintBucketService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let previewCtxStub: CanvasRenderingContext2D;

    let baseCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;

    mouseEvent = {
        offsetX: 25,
        offsetY: 25,
        button: 0,
    } as MouseEvent;

    const mouseRClickEvent = {
        offsetX: 45,
        offsetY: 45,
        button: 1,
    } as MouseEvent;

    beforeEach(() => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 100;
        canvas.height = 100;

        const drawCanvas = document.createElement('canvas') as HTMLCanvasElement;
        drawCanvas.width = 100;
        drawCanvas.height = 100;

        const selectionCanvas = document.createElement('canvas');
        selectionCanvas.width = 100;
        selectionCanvas.height = 100;
        baseCtxStub = canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvas;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PaintBucketService);
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' should call fillNonContiguousArea onRightClick', () => {
        let fillNonContiguousAreaSpy = spyOn<any>(service, 'fillNonContiguousArea').and.callThrough();
        service.onRightClick(mouseRClickEvent);
        expect(fillNonContiguousAreaSpy).toHaveBeenCalled();
    });

    it(' should call fillContiguousArea onClick', () => {
        let fillContiguousAreaSpy = spyOn<any>(service, 'fillContiguousArea').and.returnValue(new ImageData(10, 10));
        service.onClick(mouseEvent);
        expect(fillContiguousAreaSpy).toHaveBeenCalled();
    });

    it('should set primaryColor to given color when setPrimaryColor is called', () => {
        service.setPrimaryColor('#ffffff');
        expect(service.primaryColor).toEqual('#ffffff');
    });

    it('should set not change tolerance if a value less than that is given', () => {
        service.tolerance = 10;
        service.setTolerance(-10);
        expect(service.tolerance).toEqual(10);
    });

    it('should set not change tolerance if a value more than 100 is given', () => {
        service.tolerance = 30;
        service.setTolerance(101);
        expect(service.tolerance).toEqual(30);
    });

    it('should set tolerance to given value if a correct value is given', () => {
        service.tolerance = 20;
        service.setTolerance(47);
        expect(service.tolerance).toEqual(47);
    });

    it('should call fill pixel when color matches on call of fillNonContiguousArea', () => {
        (service as any).getActualColor = jasmine.createSpy('getActualColor');
        spyOn(baseCtxStub, 'getImageData').and.returnValue(new ImageData(10, 10));
        spyOn(service as any, 'areColorsMatching').and.returnValue(true);
        let fillPixelSpy = spyOn(service as any, 'fillPixel');
        (service as any).fillNonContiguousArea({ x: 10, y: 10 });
        expect(fillPixelSpy).toHaveBeenCalled();
    });

    it('should  not call fill pixel when color do not matches on call of fillNonContiguousArea', () => {
        (service as any).getActualColor = jasmine.createSpy('getActualColor');
        spyOn(baseCtxStub, 'getImageData').and.returnValue(new ImageData(10, 10));
        spyOn(service as any, 'areColorsMatching').and.returnValue(false);
        let fillPixelSpy = spyOn(service as any, 'fillPixel');
        (service as any).fillNonContiguousArea({ x: 10, y: 10 });
        expect(fillPixelSpy).not.toHaveBeenCalled();
    });

    it('should paint rectangle to black in given color when calling fillContiguousArea', () => {
        baseCtxStub.fillStyle = 'white';
        baseCtxStub.fillRect(0, 0, 10, 10);
        let newImageData: ImageData = (service as any).fillContiguousArea({ x: 1, y: 0 });
        expect(newImageData.data[10]).toEqual(0);
    });

    it('should not paint rectangle to black in given color if rectangle is not contiguous to where clicked when calling fillContiguousArea', () => {
        baseCtxStub.fillStyle = 'red';
        baseCtxStub.fillRect(0, 0, 100, 100);
        baseCtxStub.fillStyle = 'white';
        baseCtxStub.fillRect(0, 0, 10, 10);
        let newImageData: ImageData = (service as any).fillContiguousArea({ x: 50, y: 0 });
        expect(newImageData.data[10]).toEqual(255);
    });
});
