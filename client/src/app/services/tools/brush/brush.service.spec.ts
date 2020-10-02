/* tslint:disable */
import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { delay } from 'rxjs/operators';
import { BrushService } from './brush.service';

describe('BrushService', () => {
    let service: BrushService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let previewCtxStub: CanvasRenderingContext2D;

    let baseCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    let changeColorSpy: jasmine.Spy<any>;
    let getPositionSpy: jasmine.Spy<any>;

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
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);

        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawServiceSpy }],
        });
        service = TestBed.inject(BrushService);
        drawLineSpy = spyOn<any>(service, 'drawLine').and.callThrough();
        changeColorSpy = spyOn<any>(service, 'changeColor').and.callThrough();
        getPositionSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();

        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service.onMouseDown(mouseEvent);
        delay(100);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        delay(100);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set isOut property to false when the cursor exits the canvas field', () => {
        service.onMouseDown(mouseEvent);
        delay(100);
        expect(service.isOut).toEqual(false);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseRClickEvent);
        delay(10);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine if mouse was already down and the mouse didnt exit the canvas field', () => {
        service.mouseDownCoord = { x: 20, y: 20 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseUp(mouseEvent);
        delay(10);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseOut should not call drawLine just before the mouse exits the the canvas', () => {
        service.mouseDownCoord = { x: 20, y: 20 };
        service.mouseDown = true;
        service.isOut = true;
        service.onMouseOut(mouseEvent);
        delay(5);
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseOut should change isOut value to true', () => {
        service.onMouseOut(mouseEvent);
        expect(service.isOut).toEqual(true);
    });

    it(' onMouseUp should not call drawLine if mouse was not already down', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEvent);
        delay(10);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
    it(' onMouseUp should not call drawLine if mouse was not in the canvas', () => {
        service.isOut = true;
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
        delay(5);
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call drawLine if mouse was already down and not on the outside of canvas', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseMove(mouseEvent);
        delay(5);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawLineSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call drawLine if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;
        service.isOut = false;
        service.onMouseMove(mouseEvent);
        delay(5);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
    it(' onMouseMove should not call drawLine if mouse was not in the canvas field', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.isOut = true;
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        delay(5);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' onMouseEnter should not call getPosition if mouse is not down', () => {
        service.mouseDown = false;
        service.onMouseEnter(mouseEvent);
        expect(getPositionSpy).not.toHaveBeenCalled();
    });

    it(' onMouseEnter should call getPosition if mouse is down', () => {
        service.mouseDown = true;
        service.onMouseEnter(mouseEvent);
        expect(getPositionSpy).toHaveBeenCalled();
    });

    it('makeBaseImage should call changeColor', () => {
        service.makeBaseImage();
        delay(100);
        expect(changeColorSpy).toHaveBeenCalled();
    });

    it('should change image to b3 id when setTexture is called with 3 as id', () => {
        service.setTexture(3);
        let src = (service as any).image.src;
        expect(src).toContain('assets/b3.png');
    });

    it('should change color to #ababab when setPrimaryColor is called with #ababab as paramater', () => {
        service.setPrimaryColor('#ababab');
        let color = (service as any).primaryColor;
        expect(color).toEqual('#ababab');
    });
});
