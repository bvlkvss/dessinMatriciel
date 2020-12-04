/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
//import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagicWandService } from './magic-wand.service';

describe('MagicWandService', () => {
    let service: MagicWandService;
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
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(MagicWandService);
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' should set mouseDown to true when onMouseDown is called and selection is Activated', () => {
        service.mouseDown = false;
        service.onClick(mouseEvent);
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeTruthy();
    });

    it(' should not set mouseDown to true when onMouseDown is called and selection is Activated', () => {
        service.mouseDown = false;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeFalsy();
    });

    it(' should call getNonContiguousPixels onRightClick', () => {
        let getNonContiguousPixelsSpy = spyOn<any>(service, 'getNonContiguousPixels').and.callThrough();
        service.onRightClick(mouseRClickEvent);
        expect(getNonContiguousPixelsSpy).toHaveBeenCalled();
    });

    it(' should call getContiguousPixels onClick', () => {
        let getContiguousPixelsSpy = spyOn<any>(service, 'getContiguousPixels').and.callThrough();
        service.onClick(mouseEvent);
        expect(getContiguousPixelsSpy).toHaveBeenCalled();
    });

    it('should call resetMagicWandCanvas when clearSelection is called', () => {
        let resetMagicWandCanvasSpy = spyOn<any>(service, 'resetMagicWandCanvas').and.callThrough();
        (service as any).clearSelection();
        expect(resetMagicWandCanvasSpy).toHaveBeenCalled();
    });

    it(' should return a new MagicWandSelection object when createSelectionData is called', () => {
        service.selectionStartPoint = { x: 0, y: 0 };
        service.selectionEndPoint = { x: 10, y: 10 };
        service.selectionMinWidth = 10;
        service.selectionMinHeight = 10;
        let obj = (service as any).createSelectionData();
        expect(obj).toBeTruthy();
    });

    it(' should reset magicWand canvas properties when resetMagicWandCanvas is called', () => {
        (service as any).magicWandCanvas.width = 240;
        (service as any).magicWandCanvas.height = 350;
        (service as any).resetMagicWandCanvas();
        expect((service as any).magicWandCanvas.width).toEqual(100);
        expect((service as any).magicWandCanvas.height).toEqual(100);
    });

});