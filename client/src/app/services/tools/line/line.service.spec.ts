/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

import { LineService } from './line.service';

describe('LineService', () => {
    let service: LineService;

    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let drawLineSpy: jasmine.Spy<any>;
    let drawLinesSpy: jasmine.Spy<any>;
    let pushSpy: jasmine.Spy<any>;
    let popSpy: jasmine.Spy<any>;

    beforeEach(() => {
        canvasStub = canvasTestHelper.canvas;
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(LineService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        drawLinesSpy = spyOn<any>(service, 'drawLines').and.callThrough();
        pushSpy = spyOn<any>((service as any).pathData, 'push').and.callThrough();
        popSpy = spyOn<any>((service as any).pathData, 'pop').and.callThrough();
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

    it('primaryColor should be set to assigned value when setPrimaryColor is called', () => {
        service.setPrimaryColor('#ababab');
        expect(service.primaryColor).toEqual('#ababab');
    });

    it('junctionState should be set to assigned value when setJunctionState is called', () => {
        service.withJunction = false;
        service.setJunctionState(true);
        expect(service.withJunction).toEqual(true);
    });

    it('junctionWidth should be set to assigned value when setJunctionWidth is called', () => {
        service.setJunctionWidth(10);
        expect(service.junctionWidth).toEqual(10);
    });

    it('lineWidth should be set to assigned value when setLineWidth is called', () => {
        service.setLineWidth(10);
        expect(service.lineWidth).toEqual(10);
    });

    it('onClick should set isDblClicked to false', () => {
        service.isDoubleClicked = true;
        service.onClick(mouseEvent);
        expect(service.isDoubleClicked).toBe(false);
    });

    it('onClick should call push if it is not aligned', () => {
        service.toAllign = false;
        service.onClick(mouseEvent);
        expect(pushSpy).toHaveBeenCalled();
    });

    it('onClick should not call push if it is aligned', () => {
        service.toAllign = true;
        service.onClick(mouseEvent);
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('onClick should not call push if it is not a left Click', () => {
        let mouseEvent2 = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
        service.toAllign = false;
        service.onClick(mouseEvent2);
        expect(pushSpy).not.toHaveBeenCalled();
    });

    it('onDblClick should set isDoubleClick to true', () => {
        service.isDoubleClicked = false;
        let distanceSpy = spyOn<any>(service, 'distanceBetween2Points').and.returnValue(14);
        service.onDblClick(mouseEvent);
        expect(service.isDoubleClicked).toBe(true);
        expect(distanceSpy).toHaveBeenCalled();
    });

    it('onDblClick should call push if distance is more than 20 ', () => {
        service.toAllign = false;
        let distanceSpy = spyOn<any>(service, 'distanceBetween2Points').and.returnValue(30);
        service.onDblClick(mouseEvent);
        expect(service.isDoubleClicked).toBe(true);
        expect(distanceSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('onDblClick should call drawLine if distance is more than 20 and toAllign and set toAllign to false ', () => {
        (service as any).allignementPoint = { x: 4, y: 5 } as Vec2;
        service.toAllign = true;
        let distanceSpy = spyOn<any>(service, 'distanceBetween2Points').and.returnValue(30);
        service.onDblClick(mouseEvent);
        expect(service.isDoubleClicked).toBe(true);
        expect(distanceSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(popSpy).not.toHaveBeenCalled();
        expect(service.toAllign).toEqual(false);
    });

    it('onDblClick should call drawLine and pop if distance is less than 20 and toAllign and set toAllign to false ', () => {
        (service as any).allignementPoint = { x: 4, y: 5 } as Vec2;
        service.toAllign = true;
        let distanceSpy = spyOn<any>(service, 'distanceBetween2Points').and.returnValue(10);
        service.onDblClick(mouseEvent);
        expect(service.isDoubleClicked).toBe(true);
        expect(distanceSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
        expect(popSpy).toHaveBeenCalled();
        expect(service.toAllign).toEqual(false);
    });

    it('onDblClick should not call drawLine if distance is less than 20 and toAllign ', () => {
        (service as any).allignementPoint = { x: 4, y: 5 } as Vec2;
        service.toAllign = false;
        let distanceSpy = spyOn<any>(service, 'distanceBetween2Points').and.returnValue(30);
        service.onDblClick(mouseEvent);
        expect(service.isDoubleClicked).toBe(true);
        expect(distanceSpy).toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should not call drawLine or drawLines if mouse is not down ', () => {
        service.mouseDown = false;
        service.withJunction = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
        expect(drawLinesSpy).not.toHaveBeenCalled();
    });

    it('onMouseMove should  call drawLines if mouse is down and not calldrawLine if key is on escape', () => {
        service.mouseDown = true;
        service.keyOnEscape = true;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).not.toHaveBeenCalled();
        expect(drawLinesSpy).toHaveBeenCalled();
    });

    it('onMouseMove should  call drawLines if mouse is down and call drawLine if key is not on escape', () => {
        service.mouseDown = true;
        service.keyOnEscape = false;
        service.onMouseMove(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(drawLinesSpy).toHaveBeenCalled();
    });

    it('onKeyDown should  set keyOnEscapte to true and call drawLines if escape is pressed', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'Escape',
        });
        service.keyOnEscape = false;
        service.onKeyDown(event);
        expect(service.keyOnEscape).toBe(true);
        expect(drawLinesSpy).toHaveBeenCalled();
    });

    it('onKeyDown should  not call pop if Backspace is pressed and pathData.length is less or equal than 1', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'Backspace',
        });
        (service as any).pathData.length = 1;
        service.keyOnEscape = false;
        service.onKeyDown(event);
        expect(popSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should  not call pop if Backspace is pressed and pathData.length is greater than 1', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'Backspace',
        });
        (service as any).pathData.length = 3;
        service.keyOnEscape = false;
        service.onKeyDown(event);
        expect(popSpy).toHaveBeenCalled();
    });

    it('onKeyDown should call drawLine and drawLines if not dblClick and shift is pressed', () => {
        let point = { x: 0, y: 0 } as Vec2;
        let point2 = { x: 5, y: 6 } as Vec2;
        let point3 = { x: 9, y: 17 } as Vec2;
        (service as any).pathData.push(point);
        (service as any).pathData.push(point2);
        service.currentPos = point3;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });
        service.isDoubleClicked = false;
        let angleSpy = spyOn<any>(service, 'findNewPointForAngle').and.callThrough();
        service.onKeyDown(event);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(angleSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyDown should call drawLine and drawLines if not dblClick and shift is pressed with last x > current x and last y > current y', () => {
        let point = { x: 0, y: 0 } as Vec2;
        let point2 = { x: 5, y: 12 } as Vec2;
        let point3 = { x: 3, y: 8 } as Vec2;
        (service as any).pathData.push(point);
        (service as any).pathData.push(point2);
        service.currentPos = point3;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });
        service.isDoubleClicked = false;
        let angleSpy = spyOn<any>(service, 'findNewPointForAngle').and.callThrough();
        service.onKeyDown(event);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(angleSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyDown should call drawLine and drawLines if not dblClick and shift is pressed with last x > current x and ', () => {
        let point = { x: 0, y: 0 } as Vec2;
        let point2 = { x: 5, y: 6 } as Vec2;
        let point3 = { x: 3, y: 8 } as Vec2;
        (service as any).pathData.push(point);
        (service as any).pathData.push(point2);
        service.currentPos = point3;
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });
        service.isDoubleClicked = false;
        let angleSpy = spyOn<any>(service, 'findNewPointForAngle').and.callThrough();
        service.onKeyDown(event);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(angleSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call drawLine nor drawLines if another key is pressed', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
        });
        service.isDoubleClicked = false;
        service.onKeyDown(event);
        expect(drawLinesSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should not call drawLine nor drawLines if shift key is pressed', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'Shift',
            shiftKey: true,
        });
        service.isDoubleClicked = false;
        service.onKeyUp(event);
        expect(drawLinesSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should not call drawLine nor drawLines if shift key is not pressed and dblClick', () => {
        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
            shiftKey: false,
        });
        service.isDoubleClicked = true;
        service.onKeyUp(event);
        expect(drawLinesSpy).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it('onKeyUp should  call drawLine and drawLines if shift key is not pressed and not dblClick', () => {
        let point = { x: 0, y: 0 } as Vec2;
        let point2 = { x: 5, y: 6 } as Vec2;
        let point3 = { x: 9, y: 2 } as Vec2;
        (service as any).pathData.push(point);
        (service as any).pathData.push(point2);
        (service as any).pathData.push(point3);
        service.currentPos = point3;

        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
            shiftKey: false,
        });
        service.isDoubleClicked = false;
        service.onKeyUp(event);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it('onKeyUp should  call drawLine and drawLines if shift key is not pressed and not dblClick', () => {
        let point = { x: 0, y: 0 } as Vec2;
        let point2 = { x: 5, y: 6 } as Vec2;
        let point3 = { x: 9, y: 2 } as Vec2;
        (service as any).pathData.push(point);
        (service as any).pathData.push(point2);
        (service as any).pathData.push(point3);
        service.currentPos = point3;

        const event = new KeyboardEvent('document:keydown', {
            key: 'z',
            shiftKey: false,
        });
        service.isDoubleClicked = false;
        service.onKeyUp(event);
        expect(drawLinesSpy).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });
});
