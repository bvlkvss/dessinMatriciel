/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { RectangleService } from './rectangle.service';

describe('RectangleService', () => {
    let service: RectangleService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let drawRectangleSpy: jasmine.Spy<any>;

    beforeEach(() => {
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(RectangleService);
        drawRectangleSpy = spyOn<any>(service, 'drawRectangle').and.callThrough();

        service['drawingService'].canvas = canvasStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas.width = canvasStub.width;
        service['drawingService'].canvas.height = canvasStub.height;
        service['drawingService'].baseCtx.canvas.width = baseCtxStub.canvas.width;
        service['drawingService'].previewCtx.canvas.width = previewCtxStub.canvas.width;
        service['drawingService'].baseCtx.canvas.height = baseCtxStub.canvas.height;
        service['drawingService'].previewCtx.canvas.height = previewCtxStub.canvas.height;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('style should be set to assigned value when setStyle is called', () => {
        service.setStyle(2);
        expect(service.rectangleStyle).toEqual(2);
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        const mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('setLineWidth should set lineWidth to correct value', () => {
        service.setLineWidth(3);

        expect(service.lineWidth).toEqual(3);
    });

    it('setPrimaryColor should set primaryColor to correct value', () => {
        service.setPrimaryColor('#ababab');
        expect(service.primaryColor).toEqual('#ababab');
    });

    it('onMouseOut should not set isOut to true if mouse is not down', () => {
        service.mouseDown = false;
        service.isOut = false;
        service.onMouseOut(mouseEvent);
        expect(service.isOut).toBe(false);
    });

    it('onMouseOut should  set isOut to true if mouse is  down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseOut(mouseEvent);
        expect(service.isOut).toBe(true);
    });

    it('onMouseOut should not call drawRectangle if mouseDown is false', () => {
        service.mouseDown = false;
        service.onMouseOut(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('onMouseOut should call drawRectangle if mouseDown is true', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.rectangleStyle = 1;
        service.mouseDown = true;
        service.onMouseOut(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('onMouseOut should set x to 100 if more than 100', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.rectangleStyle = 2;
        let mouseOutEvent = {
            offsetX: 103,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.x).toEqual(100);
    });

    it('onMouseOut should set x to 0 if less than 0', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.rectangleStyle = 0;
        let mouseOutEvent = {
            offsetX: -2,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.x).toEqual(0);
    });

    it('onMouseOut should set y to 100 if more than 100', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        let mouseOutEvent = {
            offsetX: 25,
            offsetY: 102,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.y).toEqual(100);
    });

    it('onMouseOut should set y to 0 if less than 0', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        let mouseOutEvent = {
            offsetX: 25,
            offsetY: -2,
            button: 0,
        } as MouseEvent;
        service.mouseDown = true;
        service.onMouseOut(mouseOutEvent);
        expect(service.mouseOutCoord.y).toEqual(0);
    });

    it('onMouseEnter should set isOut to false', () => {
        service.onMouseEnter(mouseEvent);
        expect(service.isOut).toBe(false);
    });

    it('onMouseUp should not call drawRectangle if mouse is not down', () => {
        service.mouseDown = false;
        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('onMouseUp should  call drawRectangle if mouse is down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('if mouse is out onMouseUp should  call drawRectangle with mouseOutCoords', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseOutCoord = { x: 102, y: 20 };
        service.mouseDown = true;
        service.isOut = true;
        service.onMouseUp(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalledWith(service['drawingService'].baseCtx, service.mouseDownCoord, service.mouseOutCoord, false);
    });

    it('onMouseMove should  not call drawRectangle if mouse is not down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = false;
        service.onMouseMove(mouseEvent);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should  call drawRectangle if mouse is down', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.onMouseMove(mouseEvent);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('onKeyUp should not call drawRectangle if mouse is not down', () => {
        service.mouseDown = false;
        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
            shiftKey: false,
        });
        service.onKeyUp(event);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should not call drawRectangle if shift is pressed', () => {
        service.mouseDown = true;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });
        service.onKeyUp(event);
        expect(drawRectangleSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should call drawRectangle if shift is not pressed and mouseDown is true', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 8, y: 42 };
        service.mouseDown = true;
        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
            shiftKey: false,
        });

        service.onKeyUp(event);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });

    it('shift onKeyDown should not set toSquare to true if mouse is not down', () => {
        service.mouseDown = false;
        service.toSquare = false;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });

        service.onKeyDown(event);
        expect(service.toSquare).toBe(false);
    });

    it('shift onKeyDown should not set toSquare to true if mouse is down but shift is not pressed', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.mouseDown = true;
        service.toSquare = false;
        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
            shiftKey: false,
        });

        service.onKeyDown(event);
        expect(service.toSquare).toBe(false);
    });

    it('shift onKeyDown should set toSquare to true if mouse is down and shift is  pressed', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 22 };
        service.mouseDown = true;
        service.toSquare = false;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });

        service.onKeyDown(event);
        expect(service.toSquare).toBe(true);
    });

    it('shift onKeyDown should call drawRectangle and toSquare should be true if mouse is down and shift is  pressed', () => {
        service.mouseDownCoord = { x: 6, y: 20 };
        service.currentPos = { x: 20, y: 54 };
        service.mouseDown = true;
        service.toSquare = false;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });

        service.onKeyDown(event);
        expect(service.toSquare).toBe(true);
        expect(drawRectangleSpy).toHaveBeenCalled();
    });
});
