import { TestBed } from '@angular/core/testing';
import { canvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { delay } from 'rxjs/operators';
import { BrushService } from './brush.service';
// tslint:disable:no-magic-numbers
// tslint:disable:no-any
describe('BrushService', () => {
    let service: BrushService;
    let mouseEvent: MouseEvent;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let previewCtxStub: CanvasRenderingContext2D;

    let baseCtxStub: CanvasRenderingContext2D;
    let drawLineSpy: jasmine.Spy<any>;
    let changeColorSpy: jasmine.Spy<any>;

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
        // tslint:disable:no-string-literal
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service.onMouseDown(mouseEvent);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEvent);
        expect(service.mouseDown).toEqual(true);
    });
    it(' mouseDown should set isOut property to false when the cursor exits the canvas field', () => {
        service.onMouseDown(mouseEvent);
        expect(service.isOut).toEqual(false);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseRClickEvent);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should call drawLine if mouse was already down and the mouse didnt exit the canvas field', () => {
        service.mouseDownCoord = { x: 20, y: 20 };
        service.mouseDown = true;
        service.isOut = false;
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
    });
    it(' onMouseOut should not call drawLine just before the mouse exits the the canvas', () => {
        service.mouseDownCoord = { x: 20, y: 20 };
        service.mouseDown = true;
        service.isOut = true;
        service.onMouseOut(mouseEvent);
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
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
    it(' onMouseUp should not call drawLine if mouse was not in the canvas', () => {
        service.isOut = true;
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };
        service.onMouseUp(mouseEvent);
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
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });
    it(' onMouseMove should not call drawLine if mouse was not in the canvas field', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.isOut = true;
        service.mouseDown = true;

        service.onMouseMove(mouseEvent);
        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(drawLineSpy).not.toHaveBeenCalled();
    });

    it(' should not call changeColor after drawing ', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 20, y: 20 };
        service.onMouseUp(mouseEvent);
        expect(changeColorSpy).not.toHaveBeenCalled();
    });
    it(' should  call changeColor after drawing ', () => {
        service.mouseDown = false;
        service.mouseDownCoord = { x: 20, y: 20 };
        service.onMouseDown(mouseEvent);
        service.onMouseMove(mouseEvent);
        expect(changeColorSpy).toHaveBeenCalled();
    });

    /* it('it should draw a point after clicking and releasing   ', () => {
        // this will check that nothing was drawn on canvas at (0,0), after that it'll check on right coordinates which are (20,20)
        const image: HTMLImageElement = service.getImage();
        service.mouseDown = false;
        service.mouseDownCoord = { x: 20, y: 20 };
        service.currentPos = { x: 20, y: 20 };
        service.onMouseDown(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(drawLineSpy).toHaveBeenCalled();
        expect(baseCtxStub.getImageData(0, 0, image.width, image.height)).toBeDefined();
        //  expect(baseCtxStub.getImageData(20, 20, image.width, image.height)).toBeDefined();
    });*/
    it(' it should changeColor of the image after drawing   ', () => {
        // this will check that nothing was drawn on canvas at (0,0), after that it'll check on right coordinates which are (20,20)
        const image: HTMLImageElement = service.getImage();
        service.mouseDown = false;
        service.setColor({ red: 255, green: 0, blue: 30 });
        service.mouseDownCoord = { x: 20, y: 20 };
        service.onMouseDown(mouseEvent);
        service.onMouseUp(mouseEvent);
        expect(changeColorSpy).toHaveBeenCalled();
        const imageData = baseCtxStub.getImageData(20, 20, image.width, image.height);
        expect(imageData.data[0]).toEqual(255); // red
        expect(imageData.data[1]).toEqual(0); // green
        expect(imageData.data[2]).toEqual(30); // blue
    });
});
