/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { PlumeService } from './plume.service';

describe('PlumeService', () => {
    let service: PlumeService;
    let mouseEvent: MouseEvent;
    let wheelEvent: WheelEvent;
    let wheelEvent2: WheelEvent;
    let wheelEvent3: WheelEvent;
    let wheelEvent4: WheelEvent;

    let drawLineSpy: jasmine.Spy<any>;
    let drawPreviewLineSpy: jasmine.Spy<any>;
    let allocateSpaceSpy: jasmine.Spy<any>;
    let validateAngle: jasmine.Spy<any>;
    let sendMessage: jasmine.Spy<any>;

    let clearPathSpy: jasmine.Spy<any>;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(PlumeService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        drawPreviewLineSpy = spyOn<any>(service, 'drawPreviewLine').and.callThrough();
        allocateSpaceSpy = spyOn<any>(service, 'allocateSpace').and.callThrough();
        clearPathSpy = spyOn<any>(service, 'clearPath').and.callThrough();
        validateAngle = spyOn<any>(service, 'validateAngle').and.callThrough();
        sendMessage = spyOn<any>(service, 'sendMessage').and.callThrough();
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;

        mouseEvent = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        wheelEvent = {
            deltaY: 4,
            altKey: false,
        } as WheelEvent;

        wheelEvent2 = {
            deltaY: -4,
            altKey: false,
        } as WheelEvent;

        wheelEvent3 = {
            deltaY: 4,
            altKey: true,
        } as WheelEvent;

        wheelEvent4 = {
            deltaY: -4,
            altKey: true,
        } as WheelEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    it(' onMouseEnter should  call clearPath', () => {
        service.onMouseEnter(mouseEvent);
        expect(clearPathSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine and clearcanvas if mouse was already down and mouse out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDown = true;
        service.mouseIsOut = true;

        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    /* it(' onMouseUp should not call drawLine and clearcanvas if mouse was already down and mouse is not out', () => {
         service.mouseDownCoord = { x: 0, y: 0 };
         service.pathData.push(service.mouseDownCoord);
         service.mouseDown = false;
         service.mouseIsOut = false;
         service.onMouseUp(mouseEvent);
         expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
         expect(drawLineSpy).not.toHaveBeenCalled();
     });*/

    it(' onMouseUp should call drawLine and clearcanvas if mouse was already down and mouse is not out', () => {
        const mouseEvent2 = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDown = true;
        service.mouseIsOut = false;
        service.onMouseUp(mouseEvent2);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        //expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should not call drawLine and clearcanvas if mouse was not already down and mouse is out', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.mouseDown = false;
        service.mouseIsOut = true;
        service.onMouseUp(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.arrayTooLarge = false;
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawPreviewLineSpy).not.toHaveBeenCalled();
        expect(allocateSpaceSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.arrayTooLarge = false;
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        // expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
        expect(drawPreviewLineSpy).toHaveBeenCalled();
        expect(allocateSpaceSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawPreviewLineSpy if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.arrayTooLarge = true;
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        // expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawPreviewLineSpy).not.toHaveBeenCalled();
        expect(allocateSpaceSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawPreviewLineSpy if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.pathData.push(service.mouseDownCoord);
        service.arrayTooLarge = true;
        service.mouseDown = false;

        service.onMouseMove(mouseEvent);
        // expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
        expect(drawPreviewLineSpy).toHaveBeenCalled();
        expect(allocateSpaceSpy).not.toHaveBeenCalled();
    });

    it('setLineLenght should set LineLenght to correct value', () => {
        service.allocateSpace();
        expect(service.arrayTooLarge).toBe(false);
    });

    it(' onMouseOut should call clearcanvas if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseOut(mouseEvent);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('setLineLenght should set LineLenght to correct value', () => {
        service.setLineLength(3);

        expect(service.lineLenght).toEqual(3);
    });

    it('setPrimaryColor should set primaryColor to correct value', () => {
        service.setPrimaryColor('#ababab');

        expect(service.primaryColor).toEqual('#ababab');
    });

    it('setAngle should convert and set angle to correct value', () => {
        service.drawPreviewLine = jasmine.createSpy().and.callFake(() => { });
        service.setAngle(50);
        expect(service.angle).toEqual(50 * (Math.PI / 180));
    });

    it('adjust angle should adjust angle by adding 0.261799 to the angle if altkey is pressed and deltaY is a positive number', () => {
        wheelEvent.altKey;
        service.angle = 0;
        service.drawPreviewLine = jasmine.createSpy();
        service.adjustAngle(wheelEvent);
        expect(service.angle).toEqual(0.261799);
    });

    it('adjust angle should adjust angle by substracting 0.261799 to the angle if altkey is pressed and deltaY is a negative number', () => {
        wheelEvent2.altKey;
        service.angle = 1;
        service.drawPreviewLine = jasmine.createSpy();
        service.adjustAngle(wheelEvent2);
        expect(service.angle).toEqual(1 - 0.261799);
    });

    it('adjust angle should adjust angle by substracting 0.261799 to the angle if altkey is pressed and deltaY is a negative number', () => {
        wheelEvent3.altKey;
        service.angle = 0;
        service.drawPreviewLine = jasmine.createSpy();
        service.adjustAngle(wheelEvent3);
        expect(service.angle).toEqual(0.0174533);
    });

    it('adjust angle should adjust angle by substracting 0.261799 to the angle if altkey is pressed and deltaY is a negative number', () => {
        wheelEvent4.altKey;
        service.angle = 1;
        service.drawPreviewLine = jasmine.createSpy();
        service.adjustAngle(wheelEvent4);
        expect(service.angle).toEqual(1 - 0.0174533);
    });

    it(' adjustAngle should  call validateAngle', () => {
        service.drawPreviewLine = jasmine.createSpy();
        service.adjustAngle(wheelEvent);
        expect(validateAngle).toHaveBeenCalled();
    });

    it('validate angle should set angle to 360 or 2PI if degree is negative', () => {
        var degree = -2;
        service.validateAngle(degree);
        expect(service.angle).toEqual(2 * Math.PI);
        //expect(degree).toEqual(360);
    });

    it('validate angle should set angle to 0 or 2PI if degree is bigger than 360', () => {
        var degree = 361;
        service.validateAngle(degree);
        expect(service.angle).toEqual(0);
        //expect(degree).toEqual(360);
    });

    it(' validate should  call sendMessage', () => {
        var degree = -2;
        service.drawPreviewLine = jasmine.createSpy();
        service.validateAngle(degree);
        expect(sendMessage).toHaveBeenCalled();
    });
});
