/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
//import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagicWandService } from './magic-wand.service';
import { MagicWandSelection } from './magic-wand-selection';

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

    it('should not set mouseDown if selection is not activated', () => {
        service.mouseDown = false;
        service.isMagicSelectionActivated = false;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeFalsy();
    });

    it('should call invoker setIsAllowed if mouse is down on handle', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.mouseDownOnHandle = jasmine.createSpy().and.returnValue(2);
        service.invoker.setIsAllowed = jasmine.createSpy();
        service.mouseDown = false;
        service.isMagicSelectionActivated = true;
        service.onMouseDown(mouseEvent);
        expect(service.invoker.setIsAllowed).toHaveBeenCalled();
    });

    it('should set mouseDown if selection is activated', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.getUnrotatedPos = jasmine.createSpy().and.returnValue({ x: 25, y: 25 });
        service.magicSelectionObj.selectionStartPoint = { x: 0, y: 0 };
        service.magicSelectionObj.selectionEndPoint = { x: 0, y: 0 };
        service.mouseDown = false;
        service.isMagicSelectionActivated = true;
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toBeTruthy();
    });

    it('should not reset obj attributes if mouseDown is false', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.selectionStartPoint = { x: 0, y: 0 };
        service.magicSelectionObj.selectionEndPoint = { x: 0, y: 0 };
        service.magicSelectionObj.rectangleService.toSquare = true;
        service.mouseDown = false;
        service.isMagicSelectionActivated = true;
        service.onMouseUp(mouseEvent);
        expect(service.magicSelectionObj.rectangleService.toSquare).toBeTruthy();
    });

    it('should reset obj attributes if mouseDown is true', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.selectionStartPoint = { x: 0, y: 0 };
        service.magicSelectionObj.selectionEndPoint = { x: 0, y: 0 };
        service.magicSelectionObj.rectangleService.toSquare = true;
        service.mouseDown = true;
        service.isMagicSelectionActivated = true;
        service.onMouseUp(mouseEvent);
        expect(service.magicSelectionObj.rectangleService.toSquare).toBeFalsy();
    });

    it('should set mouseDownInsideSelection if mouse is down insideSelection', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.getUnrotatedPos = jasmine.createSpy().and.returnValue({ x: 25, y: 25 });
        service.magicSelectionObj.selectionStartPoint = { x: 0, y: 0 };
        service.magicSelectionObj.selectionEndPoint = { x: 50, y: 50 };
        service.mouseDown = false;
        service.isMagicSelectionActivated = true;
        service.magicSelectionObj.mouseDownInsideSelection = false;
        service.onMouseDown(mouseEvent);
        expect(service.magicSelectionObj.mouseDownInsideSelection).toBeTruthy();
    });

    it('should call drawSelectionOnBase if mouse is not down inside selection and not on handle', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.drawSelectionOnBase = jasmine.createSpy();
        service.magicSelectionObj.getUnrotatedPos = jasmine.createSpy().and.returnValue({ x: 25, y: 25 });
        service.magicSelectionObj.selectionStartPoint = { x: 0, y: 0 };
        service.magicSelectionObj.selectionEndPoint = { x: 10, y: 10 };
        service.mouseDown = false;
        service.isMagicSelectionActivated = true;
        service.magicSelectionObj.mouseDownInsideSelection = false;
        service.onMouseDown(mouseEvent);
        expect(service.magicSelectionObj.drawSelectionOnBase).toHaveBeenCalled();
    });

    it('should not call getPositionFromMouse if selection is not activated and mouse is not down', () => {
        service.getPositionFromMouse = jasmine.createSpy();
        service.isMagicSelectionActivated = false;
        service.onMouseMove(mouseEvent);
        expect(service.getPositionFromMouse).not.toHaveBeenCalled();
    });

    it('should call getPositionFromMouse if selection is  activated and mouse is  down', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.magicSelectionObj.mouseDownInsideSelection = false;
        service.getPositionFromMouse = jasmine.createSpy();
        service.magicSelectionObj.mouseDownOnHandle = jasmine.createSpy().and.returnValue(false);
        service.isMagicSelectionActivated = true;
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(service.getPositionFromMouse).toHaveBeenCalled();
    });

    it('should call resizeSelection if selection is  activated and mouse is  down and canResize is true', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.getPositionFromMouse = jasmine.createSpy();
        service.magicSelectionObj.mouseDownInsideSelection = false;
        service.magicSelectionObj.resizeSelection = jasmine.createSpy();
        service.isMagicSelectionActivated = true;
        service.mouseDown = true;
        service.canResize = true;
        service.onMouseMove(mouseEvent);
        expect(service.magicSelectionObj.resizeSelection).toHaveBeenCalled();
    });

    it('should call moveSelection if selection is  activated and mouse is  down and mouseIsDown inside the selection', () => {
        let obj: MagicWandSelection = (service as any).createSelectionObj();
        service.magicSelectionObj = obj;
        service.getPositionFromMouse = jasmine.createSpy().and.returnValue({ x: 0, y: 10 });
        service.magicSelectionObj.redrawSelection = jasmine.createSpy();
        service.magicSelectionObj.mouseDownInsideSelection = true;
        service.magicSelectionObj.moveSelection = jasmine.createSpy();
        service.isMagicSelectionActivated = true;
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(service.magicSelectionObj.moveSelection).toHaveBeenCalled();
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
    it(' should set isMagicSelectionActivated to false if deactivateAfterClick is true onClick', () => {
        service.isMagicSelectionActivated = true;
        service.deactivateAfterClick = true;
        service.onClick(mouseEvent);
        expect(service.isMagicSelectionActivated).toBeFalse();
    });

    it(' should set mouseDown inside selection to false onKeyUp if selection is active', () => {
        service.isMagicSelectionActivated = true;
        service.magicSelectionObj = (service as any).createSelectionObj();
        service.magicSelectionObj.mouseDownInsideSelection = true;
        let event = {key:'s'} as KeyboardEvent;
        service.onKeyUp(event);
        expect(service.magicSelectionObj.mouseDownInsideSelection).toBeFalsy();
    });

    /*it(' should not set mouseDown inside selection to false onKeyUp if selection is active', () => {
        service.isMagicSelectionActivated = false;
        service.magicSelectionObj = (service as any).createSelectionObj();
        service.magicSelectionObj.mouseDownInsideSelection = true;
        let event = {key:'s'} as KeyboardEvent;
        service.onKeyUp(event);
        expect(service.magicSelectionObj.mouseDownInsideSelection).toBeTruthy();
    });*/

    it(' should call resizeSelection onKeyUp if selection is active and currentHandle is not -1', () => {
        service.isMagicSelectionActivated = true;
        service.magicSelectionObj = (service as any).createSelectionObj();
        service.magicSelectionObj.mouseDownInsideSelection = true;
        service.magicSelectionObj.currenthandle = 2;
        service.magicSelectionObj.resizeSelection = jasmine.createSpy();
        let event = {key:'s'} as KeyboardEvent;
        service.onKeyUp(event);
        expect(service.magicSelectionObj.resizeSelection).toHaveBeenCalled();
    });

    it(' should call clearSelection onKeyDown if Escape is pressed', () => {
        service.magicSelectionObj = (service as any).createSelectionObj();
        service.magicSelectionObj.mouseDownInsideSelection = true;
        service.magicSelectionObj.currenthandle = 2;
        service.magicSelectionObj.drawSelectionOnBase = jasmine.createSpy();
        service['clearSelection'] = jasmine.createSpy();
        let event = {key:'Escape'} as KeyboardEvent;
        service.onKeyDown(event);
        expect(service['clearSelection']).toHaveBeenCalled();
    });

    it(' should set toSquare onKeyDown if shift is pressed and currentHandle is not -1 and mouse is down', () => {
        service.magicSelectionObj = (service as any).createSelectionObj();
        service.mouseDown = true;
        service.magicSelectionObj.currenthandle = 2;
        service.magicSelectionObj.rectangleService.toSquare = false;
        service.magicSelectionObj.resizeSelection = jasmine.createSpy();
        let event = {shiftKey:true, key:'shift'} as KeyboardEvent;
        service.onKeyDown(event);
        expect(service.magicSelectionObj.rectangleService.toSquare ).toBeTruthy();
    });

    it(' should call moveSelectionWithKeys onKeyDown if an arrow is pressed', () => {
        service.magicSelectionObj = (service as any).createSelectionObj();
        service.mouseDown = true;
        service.magicSelectionObj.currenthandle = 2;
        service.magicSelectionObj.moveSelectionWithKeys = jasmine.createSpy();
        service.magicSelectionObj.redrawSelection = jasmine.createSpy();
        let event = {key:'Arrow', preventDefault:()=>{}, stopPropagation:()=>{}} as KeyboardEvent;
        service.onKeyDown(event);
        expect(service.magicSelectionObj.moveSelectionWithKeys ).toBeTruthy();
    });

    it(' should call fillPixel when eraseSelectionFromBase is called', () => {
        service.magicSelectionObj = (service as any).createSelectionObj();
        (service.magicSelectionObj as any).fillPixel = jasmine.createSpy();
        baseCtxStub.getImageData = jasmine.createSpy();
        baseCtxStub.putImageData = jasmine.createSpy();
        service.magicSelectionObj.selectionPixels = [1,2,3];
        service.magicSelectionObj.eraseSelectionFromBase({x:0,y:0});
        expect((service.magicSelectionObj as any).fillPixel  ).toHaveBeenCalled();
    });
    it(' should call fillPixel when eraseSelectionOnDelete is called', () => {
        service.magicSelectionObj = (service as any).createSelectionObj();
        (service.magicSelectionObj as any).fillPixel = jasmine.createSpy();
        service.magicSelectionObj.selectionStartPoint = {x:7, y:8};
        service.magicSelectionObj.selectionData.getContext = jasmine.createSpy().and.returnValue(baseCtxStub);
        baseCtxStub.getImageData = jasmine.createSpy().and.returnValue({data:[1,2,3,4,5,6,7,8,9,19]});
        baseCtxStub.putImageData = jasmine.createSpy();
        service.magicSelectionObj.selectionPixels = [1,2,3];
        service.magicSelectionObj.eraseSelectionOnDelete();
        expect((service.magicSelectionObj as any).fillPixel  ).toHaveBeenCalled();
    });
});
